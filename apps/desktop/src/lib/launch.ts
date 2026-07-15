import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import type { ToolId } from "@workspace/types";

/**
 * Builds the per-OS `{ command, args, cwd }` payload for a launch request.
 *
 * The Rust `launch_tool` command is a thin generic "spawn this detached"
 * function — it does NOT know about individual tools. Instead the frontend
 * branches per OS here so adding a new tool is just another entry in
 * `TOOL_META`, not new Rust code paths.
 */
export interface LaunchRequest {
  command: string;
  args: string[];
  cwd: string;
}

type OS = "windows" | "macos" | "linux";

/** Detect the host OS from the webview user agent (no extra native plugin). */
function detectOs(): OS {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  return "linux";
}

const OS = detectOs();

/** Static metadata for each launchable tool (label + which OS commands to use). */
export interface ToolMeta {
  id: ToolId;
  label: string;
  build: (cwd: string) => LaunchRequest;
}

export const TOOL_META: ToolMeta[] = [
  {
    id: "explorer",
    label: "Open in Files",
    build: (cwd) => {
      if (OS === "windows") return { command: "explorer", args: [cwd], cwd };
      if (OS === "macos") return { command: "open", args: [cwd], cwd };
      return { command: "xdg-open", args: [cwd], cwd };
    },
  },
  {
    id: "terminal",
    label: "Terminal",
    build: (cwd) => {
      if (OS === "windows") return { command: "wt", args: ["-d", cwd], cwd };
      if (OS === "macos")
        return { command: "open", args: ["-a", "Terminal", cwd], cwd };
      return {
        command: "x-terminal-emulator",
        args: ["--working-directory", cwd],
        cwd,
      };
    },
  },
  {
    id: "vscode",
    label: "VS Code",
    build: (cwd) => ({ command: "code", args: [cwd], cwd }),
  },
  {
    id: "cursor",
    label: "Cursor",
    build: (cwd) => ({ command: "cursor", args: [cwd], cwd }),
  },
  {
    id: "claude",
    label: "Claude Code",
    build: (cwd) => {
      if (OS === "windows")
        return { command: "wt", args: ["-d", cwd, "claude"], cwd };
      if (OS === "macos")
        return {
          command: "osascript",
          args: [
            "-e",
            `tell application "Terminal" to do script "cd '${cwd}' && claude"`,
          ],
          cwd,
        };
      return {
        command: "x-terminal-emulator",
        args: ["-e", "bash", "-c", `cd '${cwd}' && claude`],
        cwd,
      };
    },
  },
];

interface LaunchResult {
  success: boolean;
  error: string | null;
}

/**
 * Launch a tool for a project and surface the result to the UI.
 * Returns true on success. Never throws — failures become toasts.
 */
export async function launchTool(
  tool: ToolMeta,
  cwd: string,
): Promise<boolean> {
  const request = tool.build(cwd);
  try {
    const result = await invoke<LaunchResult>("launch_tool", { request });
    if (!result.success) {
      toast.error(`Couldn't launch ${tool.label}`, {
        description: result.error ?? "Unknown error.",
      });
      return false;
    }
    return true;
  } catch (err) {
    toast.error(`Couldn't launch ${tool.label}`, {
      description: String(err),
    });
    return false;
  }
}
