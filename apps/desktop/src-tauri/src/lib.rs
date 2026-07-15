mod share_server;

use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use std::sync::Arc;
use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    WindowEvent,
};
use tokio::sync::Mutex;

// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------

fn migrations() -> Vec<tauri_plugin_sql::Migration> {
    vec![
        tauri_plugin_sql::Migration {
            version: 1,
            description: "create_projects_table",
            sql: "CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_opened_at TEXT
        );",
            kind: tauri_plugin_sql::MigrationKind::Up,
        },
        tauri_plugin_sql::Migration {
            version: 2,
            description: "create_todos_table",
            sql: "CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            done INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );",
            kind: tauri_plugin_sql::MigrationKind::Up,
        },
        tauri_plugin_sql::Migration {
            version: 3,
            description: "create_errors_table",
            sql: "CREATE TABLE IF NOT EXISTS errors (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'medium',
            status TEXT NOT NULL DEFAULT 'open',
            created_at TEXT NOT NULL,
            fixed_at TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );",
            kind: tauri_plugin_sql::MigrationKind::Up,
        },
        tauri_plugin_sql::Migration {
            version: 4,
            description: "create_project_skills_table",
            sql: "CREATE TABLE IF NOT EXISTS project_skills (
            project_id TEXT NOT NULL,
            skill_id TEXT NOT NULL,
            added_at TEXT NOT NULL,
            PRIMARY KEY (project_id, skill_id),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );",
            kind: tauri_plugin_sql::MigrationKind::Up,
        },
        tauri_plugin_sql::Migration {
            version: 5,
            description: "create_shared_items_table",
            sql: "CREATE TABLE IF NOT EXISTS shared_items (
            id TEXT PRIMARY KEY,
            item_type TEXT NOT NULL,
            content TEXT NOT NULL,
            received_at TEXT NOT NULL
        );",
            kind: tauri_plugin_sql::MigrationKind::Up,
        },
        tauri_plugin_sql::Migration {
            version: 6,
            description: "create_timeline_items_table",
            sql: "CREATE TABLE IF NOT EXISTS timeline_items (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            start_date TEXT NOT NULL,
            end_date TEXT,
            status TEXT NOT NULL DEFAULT 'planned',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );",
            kind: tauri_plugin_sql::MigrationKind::Up,
        },
    ]
}

// ---------------------------------------------------------------------------
// Launch-tool command
// ---------------------------------------------------------------------------

/// What the frontend sends when requesting a tool launch.
#[derive(Debug, Deserialize)]
pub struct LaunchRequest {
    /// The raw command to execute (e.g. "code", "explorer", "wt").
    pub command: String,
    /// Arguments to pass after the working-directory arguments.
    pub args: Vec<String>,
    /// Absolute path of the project — the command's working directory.
    pub cwd: String,
}

/// Generic result returned to the frontend.
#[derive(Serialize)]
pub struct LaunchResult {
    pub success: bool,
    pub error: Option<String>,
}

/// Check whether a command is available on PATH (lightweight, no spawn).
fn command_exists(cmd: &str) -> bool {
    #[cfg(target_os = "windows")]
    {
        // On Windows use `where` (built into cmd.exe).
        Command::new("where")
            .arg(cmd)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    }
    #[cfg(not(target_os = "windows"))]
    {
        // On Unix use `which`.
        Command::new("which")
            .arg(cmd)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    }
}

/// Spawn a command **detached** so it survives the Tauri app closing.
#[cfg(target_os = "windows")]
fn spawn_detached(cmd: &str, args: &[String], cwd: &str) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    use windows_sys::Win32::System::Threading::{
        CREATE_NEW_PROCESS_GROUP, CREATE_NO_WINDOW, DETACHED_PROCESS,
    };

    const DETACHED: u32 = CREATE_NEW_PROCESS_GROUP | DETACHED_PROCESS;

    Command::new(cmd)
        .args(args)
        .current_dir(cwd)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .stdin(Stdio::null())
        .creation_flags(DETACHED | CREATE_NO_WINDOW)
        .spawn()
        .map_err(|e| format!("Failed to launch '{}': {}", cmd, e))?;

    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn spawn_detached(cmd: &str, args: &[String], cwd: &str) -> Result<(), String> {
    use std::os::unix::process::CommandExt;

    Command::new(cmd)
        .args(args)
        .current_dir(cwd)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .stdin(Stdio::null())
        .process_group(0)
        .spawn()
        .map_err(|e| format!("Failed to launch '{}': {}", cmd, e))?;

    Ok(())
}

/// Tauri command: launch an external tool at a project's directory.
#[tauri::command]
async fn launch_tool(request: LaunchRequest) -> Result<LaunchResult, String> {
    if !command_exists(&request.command) {
        return Ok(LaunchResult {
            success: false,
            error: Some(format!(
                "'{}' not found on PATH. Is it installed?",
                request.command
            )),
        });
    }

    match spawn_detached(&request.command, &request.args, &request.cwd) {
        Ok(()) => Ok(LaunchResult {
            success: true,
            error: None,
        }),
        Err(err) => Ok(LaunchResult {
            success: false,
            error: Some(err),
        }),
    }
}

// ---------------------------------------------------------------------------
// Export command (JSON write)
// ---------------------------------------------------------------------------

/// Writes a JSON string to a file at the given path.
#[tauri::command]
async fn write_text_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, &content).map_err(|e| format!("Failed to write file: {}", e))
}

// ---------------------------------------------------------------------------
// Skill install command
// ---------------------------------------------------------------------------

/// Request to install a skill into a project via `npx`.
#[derive(Debug, Deserialize)]
pub struct InstallSkillRequest {
    pub command: String,
    pub cwd: String,
}

#[derive(Serialize)]
pub struct InstallResult {
    pub success: bool,
    pub error: Option<String>,
}

#[cfg(target_os = "windows")]
fn kill_by_pid(pid: u32) {
    let _ = Command::new("taskkill")
        .args(["/PID", &pid.to_string(), "/F", "/T"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
}

#[cfg(not(target_os = "windows"))]
fn kill_by_pid(pid: u32) {
    let _ = Command::new("kill")
        .args(["-9", &pid.to_string()])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
}

fn run_npx_install(request: &InstallSkillRequest) -> Result<InstallResult, String> {
    use std::io::Read;
    use std::sync::{mpsc, Arc, Mutex};
    use std::time::Duration;

    let (shell, flag) = if cfg!(target_os = "windows") {
        ("cmd", "/C")
    } else {
        ("sh", "-c")
    };
    let full = format!("npx {}", request.command);

    let mut child = Command::new(shell)
        .arg(flag)
        .arg(&full)
        .current_dir(&request.cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start npx: {}", e))?;

    let mut stdout = child.stdout.take().expect("piped stdout");
    let mut stderr = child.stderr.take().expect("piped stderr");
    let buffer = Arc::new(Mutex::new(String::new()));

    let make_reader = |mut pipe: Box<dyn std::io::Read + Send>, prefix: &'static str| {
        let buf = Arc::clone(&buffer);
        std::thread::spawn(move || {
            let mut s = String::new();
            if pipe.read_to_string(&mut s).is_ok() && !s.is_empty() {
                let mut g = buf.lock().unwrap();
                g.push_str(prefix);
                g.push_str(&s);
                if !s.ends_with('\n') {
                    g.push('\n');
                }
            }
        })
    };
    make_reader(Box::new(stdout), "[stdout] ");
    make_reader(Box::new(stderr), "[stderr] ");

    let pid = child.id();
    let (tx, rx) = mpsc::channel::<std::process::ExitStatus>();
    std::thread::spawn(move || {
        if let Ok(status) = child.wait() {
            let _ = tx.send(status);
        }
    });

    match rx.recv_timeout(Duration::from_secs(120)) {
        Ok(status) => {
            let output = { buffer.lock().unwrap().clone() };
            if status.success() {
                Ok(InstallResult {
                    success: true,
                    error: None,
                })
            } else {
                Ok(InstallResult {
                    success: false,
                    error: Some(format!(
                        "npx exited with code {}.{}",
                        status.code().unwrap_or(-1),
                        if output.is_empty() {
                            String::new()
                        } else {
                            format!("\n{}", output)
                        }
                    )),
                })
            }
        }
        Err(mpsc::RecvTimeoutError::Timeout) => {
            kill_by_pid(pid);
            Ok(InstallResult {
                success: false,
                error: Some(
                    "npx timed out after 120s (network stall or hung install).".to_string(),
                ),
            })
        }
        Err(mpsc::RecvTimeoutError::Disconnected) => {
            Ok(InstallResult {
                success: false,
                error: Some(
                    "npx process disconnected unexpectedly.".to_string(),
                ),
            })
        }
    }
}

#[tauri::command]
async fn install_skill(request: InstallSkillRequest) -> Result<InstallResult, String> {
    tauri::async_runtime::spawn_blocking(move || run_npx_install(&request))
        .await
        .map_err(|e| format!("internal error: {}", e))?
}

// ---------------------------------------------------------------------------
// Share server commands
// ---------------------------------------------------------------------------

/// Managed state for the share server controller.
struct ShareController {
    inner: Arc<Mutex<Option<share_server::ServerController>>>,
}

/// Start the mobile share HTTP server. Returns the URL to connect to.
#[tauri::command]
async fn start_share_server(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, ShareController>,
) -> Result<String, String> {
    // Prevent starting a second server
    {
        let guard = state.inner.lock().await;
        if guard.is_some() {
            return Err("Share server is already running".into());
        }
    }

    let controller = share_server::start(app_handle).await?;
    let url = controller.url.clone();

    *state.inner.lock().await = Some(controller);

    Ok(url)
}

/// Stop the mobile share HTTP server.
#[tauri::command]
async fn stop_share_server(
    state: tauri::State<'_, ShareController>,
) -> Result<(), String> {
    let mut guard = state.inner.lock().await;
    if let Some(controller) = guard.take() {
        // Dropping the sender signals the graceful shutdown via oneshot
        drop(controller.shutdown_tx);
        Ok(())
    } else {
        Err("No share server is running".into())
    }
}

/// Return all shared items received this session.
#[tauri::command]
async fn get_shared_items(
    state: tauri::State<'_, ShareController>,
) -> Result<Vec<share_server::SharedItem>, String> {
    let guard = state.inner.lock().await;
    match guard.as_ref() {
        Some(controller) => {
            let items = controller.items.lock().await;
            Ok(items.clone())
        }
        None => Ok(Vec::new()),
    }
}

// ---------------------------------------------------------------------------
// App bootstrap
// ---------------------------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None::<Vec<&str>>))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:dev-organizer.db", migrations())
                .build(),
        )
        .on_window_event(|window, event| {
            // Minimise to tray instead of closing.
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .setup(|app| {
            // Managed state for share server
            app.manage(ShareController {
                inner: Arc::new(Mutex::new(None)),
            });

            // Use the default window icon for the tray, or a fallback.
            let icon = app.default_window_icon().cloned().unwrap_or_else(|| {
                tauri::image::Image::new_owned(
                    std::iter::repeat([42u8, 42, 42, 255]).flatten().take(32 * 32 * 4).collect(),
                    32,
                    32,
                )
            });

            // Build tray menu items.
            let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .icon(icon)
                .tooltip("Dev Project Organizer")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            launch_tool,
            write_text_file,
            install_skill,
            start_share_server,
            stop_share_server,
            get_shared_items,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
