//! Mobile share HTTP server — axum-based, started on-demand from the Share panel.
//!
//! Serves a mobile-friendly HTML page at GET / for receiving text/image items
//! from a phone on the same LAN. Items are stored in-memory and forwarded to
//! the desktop frontend via Tauri events.

use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::{oneshot, Mutex};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/// A single item received from the phone.
///
/// Uses camelCase serialization so Tauri events match the TS `SharedItem`
/// interface in `@workspace/types` without manual field mapping.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SharedItem {
    pub id: String,
    /// "text" or "image"
    pub item_type: String,
    /// Text content or absolute path to saved image file
    pub content: String,
    /// ISO-8601 timestamp
    pub received_at: String,
}

/// Shared state passed to every axum handler.
#[derive(Clone)]
pub struct ShareServerState {
    pub items: Arc<Mutex<Vec<SharedItem>>>,
    pub app_handle: AppHandle,
}

/// Opaque handle that can shut the server down.
pub struct ServerController {
    pub shutdown_tx: oneshot::Sender<()>,
    pub url: String,
    pub items: Arc<Mutex<Vec<SharedItem>>>,
}

// ---------------------------------------------------------------------------
// Temp directory cleanup
// ---------------------------------------------------------------------------

/// Delete temp files older than 24 hours to prevent accumulation.
fn clean_old_temp_files() {
    let temp_dir = std::env::temp_dir().join("dev-project-organizer-share");
    if !temp_dir.exists() {
        return;
    }
    let now = std::time::SystemTime::now();
    let max_age = std::time::Duration::from_secs(86400); // 24 hours

    if let Ok(entries) = std::fs::read_dir(&temp_dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if let Ok(modified) = metadata.modified() {
                    if now.duration_since(modified).ok().map_or(false, |age| age > max_age) {
                        let _ = std::fs::remove_file(entry.path());
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

/// Attempt to start the share server on an OS-assigned port.
///
/// Returns the full URL (e.g. `http://192.168.1.42:54321`) on success.
pub async fn start(app_handle: AppHandle) -> Result<ServerController, String> {
    // Clean up stale temp files from previous sessions
    clean_old_temp_files();

    // Detect LAN IP
    let ip =
        local_ip_address::local_ip().map_err(|e| format!("Failed to detect LAN IP: {}", e))?;

    // Bind to port 0 so the OS picks a free port
    let std_listener = std::net::TcpListener::bind("0.0.0.0:0")
        .map_err(|e| format!("Failed to bind TCP socket: {}", e))?;
    let port = std_listener
        .local_addr()
        .map_err(|e| format!("Failed to read assigned port: {}", e))?
        .port();

    let url = format!("http://{}:{}", ip, port);

    // Shared state
    let items: Arc<Mutex<Vec<SharedItem>>> = Arc::new(Mutex::new(Vec::new()));
    let state = ShareServerState {
        items: Arc::clone(&items),
        app_handle: app_handle.clone(),
    };

    let app = Router::new()
        .route("/", get(root_handler))
        .route("/send-text", post(send_text_handler))
        .route("/send-file", post(send_file_handler))
        .with_state(state);

    let tokio_listener = tokio::net::TcpListener::from_std(std_listener)
        .map_err(|e| format!("Failed to create tokio listener: {}", e))?;

    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();

    // Spawn the server on the existing tokio runtime
    tokio::spawn(async move {
        axum::serve(tokio_listener, app)
            .with_graceful_shutdown(async { shutdown_rx.await.ok(); })
            .await
            .ok();
    });

    Ok(ServerController {
        shutdown_tx,
        url,
        items,
    })
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/// GET / — serve the mobile-friendly HTML page.
async fn root_handler() -> Html<&'static str> {
    Html(MOBILE_PAGE)
}

/// Form payload for text submissions.
#[derive(Debug, Deserialize)]
struct TextForm {
    content: String,
}

/// POST /send-text — receive a text item from the phone.
async fn send_text_handler(
    State(state): State<ShareServerState>,
    axum::Form(form): axum::Form<TextForm>,
) -> impl IntoResponse {
    let content = form.content.trim().to_string();
    if content.is_empty() {
        return (StatusCode::BAD_REQUEST, "Content is empty").into_response();
    }

    let item = SharedItem {
        id: generate_id(),
        item_type: "text".into(),
        content,
        received_at: now(),
    };

    // Store in shared memory
    state.items.lock().await.push(item.clone());

    // Emit event to the desktop frontend
    let _ = state.app_handle.emit("new-shared-item", &item);

    (StatusCode::OK, "Received ✓").into_response()
}

/// POST /send-file — receive a file (image) upload from the phone.
/// Saved to the OS temp directory so the desktop app can display them.
async fn send_file_handler(
    State(state): State<ShareServerState>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let mut saved = Vec::new();
    let temp_dir = std::env::temp_dir().join("dev-project-organizer-share");
    let _ = std::fs::create_dir_all(&temp_dir);

    while let Ok(Some(field)) = multipart.next_field().await {
        let file_name = field.file_name().unwrap_or("upload").to_string();
        let content_type = field.content_type().unwrap_or("application/octet-stream").to_string();
        let data = match field.bytes().await {
            Ok(d) => d,
            Err(_) => continue,
        };

        // Save to temp dir with a unique name
        let ext = file_name
            .rsplit('.')
            .next()
            .map(|e| format!(".{}", e))
            .unwrap_or_default();
        let save_name = format!("{}{}", generate_id(), ext);
        let save_path = temp_dir.join(&save_name);

        if let Err(e) = std::fs::write(&save_path, &data) {
            eprintln!("Failed to save uploaded file: {}", e);
            continue;
        }

        let item = SharedItem {
            id: generate_id(),
            item_type: if content_type.starts_with("image/") {
                "image"
            } else {
                "file"
            }
            .into(),
            content: save_path.to_string_lossy().to_string(),
            received_at: now(),
        };

        state.items.lock().await.push(item.clone());
        let _ = state.app_handle.emit("new-shared-item", &item);
        saved.push(item.id);
    }

    if saved.is_empty() {
        return (StatusCode::BAD_REQUEST, "No file received").into_response();
    }

    (StatusCode::OK, "Uploaded ✓").into_response()
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Generate a reasonably unique ID without external deps.
fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!("{:016x}", nanos)
}

/// ISO-8601 timestamp.
fn now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let d = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = d.as_secs();

    let days = secs / 86400;
    let time_secs = secs % 86400;
    let hours = time_secs / 3600;
    let minutes = (time_secs % 3600) / 60;
    let seconds = time_secs % 60;

    let mut y = 1970i64;
    let mut d = days as i64;
    loop {
        let yd = if is_leap(y) { 366 } else { 365 };
        if d < yd {
            break;
        }
        d -= yd;
        y += 1;
    }
    let mdays: &[i64] = if is_leap(y) {
        &[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    } else {
        &[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    };
    let mut m = 1;
    for &md in mdays {
        if d < md {
            break;
        }
        d -= md;
        m += 1;
    }

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        y, m, d + 1, hours, minutes, seconds
    )
}

fn is_leap(year: i64) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

// ---------------------------------------------------------------------------
// Mobile HTML page (embedded)
// ---------------------------------------------------------------------------

const MOBILE_PAGE: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<title>Send to Desktop</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#e4e4e7;min-height:100dvh;display:flex;flex-direction:column;align-items:center;padding:24px 16px}
  h1{font-size:22px;font-weight:600;margin-bottom:8px;letter-spacing:-0.3px}
  .sub{font-size:13px;color:#a1a1aa;margin-bottom:32px;text-align:center}
  .card{background:#18181b;border:1px solid #27272a;border-radius:16px;padding:24px;width:100%;max-width:400px;margin-bottom:16px}
  label{display:block;font-size:13px;font-weight:500;margin-bottom:8px;color:#a1a1aa}
  textarea,.file-label{width:100%;background:#09090b;border:1px solid #27272a;border-radius:10px;color:#e4e4e7;font-size:15px;padding:12px;resize:none;font-family:inherit;transition:border-color .2s}
  textarea:focus{outline:none;border-color:#6366f1}
  textarea{min-height:80px}
  input[type=file]{display:none}
  .file-label{display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font-size:14px;padding:14px 12px;color:#a1a1aa;border-style:dashed}
  .file-label.has-file{border-color:#6366f1;color:#e4e4e7}
  button{width:100%;background:#6366f1;color:#fff;border:none;border-radius:10px;padding:14px;font-size:15px;font-weight:600;cursor:pointer;margin-top:14px;transition:background .2s,opacity .2s}
  button:active{background:#4f46e5}
  button:disabled{opacity:.5;cursor:not-allowed}
  .status{margin-top:12px;text-align:center;font-size:13px;min-height:20px;transition:opacity .3s}
  .status.success{color:#22c55e}
  .status.error{color:#ef4444}
  .icon{width:20px;height:20px;vertical-align:middle}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .uploading .file-label{animation:pulse 1s infinite}
</style>
</head>
<body>
  <h1>Send to Desktop</h1>
  <p class="sub">Your items appear instantly on your computer</p>

  <!-- Text card -->
  <div class="card">
    <label for="message">Text message</label>
    <textarea id="message" placeholder="Paste a link, note, or snippet…" maxlength="5000"></textarea>
    <button id="sendText" onclick="sendText()">Send</button>
    <div id="textStatus" class="status"></div>
  </div>

  <!-- Image card -->
  <div class="card" id="uploadCard">
    <label>Image or file</label>
    <label for="fileInput" class="file-label" id="fileLabel">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      Choose a file…
    </label>
    <input type="file" id="fileInput" accept="image/*,video/*,.pdf,.doc,.docx,.txt" onchange="updateFileLabel()"/>
    <button id="sendFile" onclick="sendFile()" disabled>Upload</button>
    <div id="fileStatus" class="status"></div>
  </div>

<script>
const $ = id => document.getElementById(id);

function setStatus(id, msg, type) {
  const el = $(id);
  el.textContent = msg;
  el.className = 'status ' + type;
  setTimeout(() => { if(el.textContent === msg) el.className = 'status'; }, 3000);
}

async function sendText() {
  const msg = $('message');
  const text = msg.value.trim();
  if(!text) return;
  const btn = $('sendText');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    const res = await fetch('/send-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'content=' + encodeURIComponent(text),
    });
    if(res.ok) {
      setStatus('textStatus', '✓ Sent!', 'success');
      msg.value = '';
    } else {
      setStatus('textStatus', '✗ Failed to send', 'error');
    }
  } catch(e) {
    setStatus('textStatus', '✗ Connection error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send';
  }
}

function updateFileLabel() {
  const input = $('fileInput');
  const label = $('fileLabel');
  const btn = $('sendFile');
  if(input.files.length > 0) {
    label.textContent = '📎 ' + input.files[0].name;
    label.className = 'file-label has-file';
    btn.disabled = false;
  } else {
    label.textContent = 'Choose a file…';
    label.className = 'file-label';
    btn.disabled = true;
  }
}

async function sendFile() {
  const input = $('fileInput');
  if(!input.files.length) return;
  const btn = $('sendFile');
  const card = $('uploadCard');
  btn.disabled = true;
  btn.textContent = 'Uploading…';
  card.classList.add('uploading');
  try {
    const fd = new FormData();
    fd.append('file', input.files[0]);
    const res = await fetch('/send-file', { method: 'POST', body: fd });
    if(res.ok) {
      setStatus('fileStatus', '✓ Uploaded!', 'success');
      input.value = '';
      updateFileLabel();
    } else {
      setStatus('fileStatus', '✗ Upload failed', 'error');
    }
  } catch(e) {
    setStatus('fileStatus', '✗ Connection error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Upload';
    card.classList.remove('uploading');
  }
}
</script>
</body>
</html>"#;
