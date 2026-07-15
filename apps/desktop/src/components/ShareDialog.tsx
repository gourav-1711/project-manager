import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as QRCode from "qrcode";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui";
import type { Project, SharedItem } from "@workspace/types";
import { useSharedItems } from "@/hooks/useSharedItems";
import {
  Copy,
  FileDown,
  Smartphone,
  Wifi,
  WifiOff,
  Trash2,
  Loader2,
  AlertTriangle,
  Scan,
} from "lucide-react";

export function ShareDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    status: serverStatus,
    url: serverUrl,
    error: serverError,
    items: sharedItems,
    start: startServer,
    stop: stopServer,
    clearItems,
  } = useSharedItems();

  const [projectQrReady, setProjectQrReady] = useState(false);
  const [serverQrReady, setServerQrReady] = useState(false);
  const projectQrRef = useRef<HTMLCanvasElement>(null);
  const serverQrRef = useRef<HTMLCanvasElement>(null);

  // Generate QR for the project path
  useEffect(() => {
    if (!open || !projectQrRef.current) {
      setProjectQrReady(false);
      return;
    }
    let cancelled = false;
    requestAnimationFrame(async () => {
      try {
        await QRCode.toCanvas(projectQrRef.current!, project.path, {
          width: 160,
          margin: 2,
          color: { dark: "#000", light: "#fff" },
        });
        if (!cancelled) setProjectQrReady(true);
      } catch {
        // silently ignore
      }
    });
    return () => { cancelled = true; };
  }, [open, project.path]);

  // Generate QR for the share server URL when available
  useEffect(() => {
    if (!serverUrl || !serverQrRef.current) {
      setServerQrReady(false);
      return;
    }
    let cancelled = false;
    requestAnimationFrame(async () => {
      try {
        await QRCode.toCanvas(serverQrRef.current!, serverUrl, {
          width: 180,
          margin: 2,
          color: { dark: "#000", light: "#fff" },
        });
        if (!cancelled) setServerQrReady(true);
      } catch {
        // silently ignore
      }
    });
    return () => { cancelled = true; };
  }, [serverUrl]);

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(project.path);
      toast.success("Path copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function exportJSON() {
    try {
      const dest = await save({
        filters: [{ name: "JSON", extensions: ["json"] }],
        defaultPath: `${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`,
      });
      if (!dest) return;

      invoke("write_text_file", {
        path: dest,
        content: JSON.stringify(project, null, 2),
      })
        .then(() => toast.success("Project exported successfully"))
        .catch((err: unknown) =>
          toast.error("Failed to export", { description: String(err) }),
        );
    } catch {
      toast.error("Export cancelled or failed");
    }
  }

  async function handleStartServer() {
    await startServer();
  }

  async function handleStopServer() {
    await stopServer();
  }

  const isServerBusy = serverStatus === "starting";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg dialog-glass">
        <DialogHeader>
          <DialogTitle>Share & Export</DialogTitle>
          <DialogDescription>
            Share "{project.name}" with your phone or export as JSON.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* ── Project path QR + export ── */}
          <div className="flex flex-col items-center gap-3 rounded-lg border glass-subtle p-4">
            <div className="flex items-center gap-2">
              <Scan className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Project path</span>
            </div>
            <canvas
              ref={projectQrRef}
              className="rounded-md border"
              width={160}
              height={160}
              style={{ opacity: projectQrReady ? 1 : 0, transition: "opacity 0.3s" }}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyPath}>
                <Copy className="size-3.5" />
                Copy Path
              </Button>
              <Button variant="outline" size="sm" onClick={exportJSON}>
                <FileDown className="size-3.5" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* ── Mobile share server ── */}
          <div className="flex flex-col gap-3 rounded-lg border glass-subtle p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Send to phone</span>
            </div>

            {serverStatus === "stopped" && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Start a temporary server to receive text and images from your
                  phone on the same Wi-Fi network.
                </p>
                <Button
                  size="sm"
                  className="mt-1 w-full gap-1.5"
                  onClick={handleStartServer}
                >
                  <Wifi className="size-4" />
                  Start Share Server
                </Button>
              </div>
            )}

            {serverStatus === "starting" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Starting server…
                </p>
              </div>
            )}

            {serverStatus === "error" && (
              <div className="flex flex-col items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center">
                <AlertTriangle className="size-5 text-destructive" />
                <p className="text-xs text-destructive">
                  {serverError ?? "Failed to start server"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartServer}
                >
                  Retry
                </Button>
              </div>
            )}

            {serverStatus === "running" && serverUrl && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Wifi className="size-3.5" />
                  Server running
                </div>

                <p className="text-xs text-muted-foreground">
                  Scan with your phone camera or open the URL in a browser
                </p>

                <canvas
                  ref={serverQrRef}
                  className="rounded-md border"
                  width={180}
                  height={180}
                  style={{ opacity: serverQrReady ? 1 : 0, transition: "opacity 0.3s" }}
                />

                <p className="select-all rounded-md bg-muted px-3 py-1.5 font-mono text-xs">
                  {serverUrl}
                </p>

                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleStopServer}
                  disabled={isServerBusy}
                >
                  <WifiOff className="size-4" />
                  Stop Server
                </Button>
              </div>
            )}
          </div>

          {/* ── Received items ── */}
          {(serverStatus === "running" || sharedItems.length > 0) && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Received ({sharedItems.length})
                </span>
                {sharedItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-xs"
                    onClick={clearItems}
                  >
                    <Trash2 className="size-3" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
                {sharedItems.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Waiting for items from your phone…
                  </p>
                ) : (
                  sharedItems.map((item) => (
                    <SharedItemCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Security notice ── */}
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <p>
              Anyone on your Wi-Fi with the QR code or link can send you items.
              Same-network only — nothing leaves your machine.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SharedItemCard({ item }: { item: SharedItem }) {
  const [copied, setCopied] = useState(false);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  const timeAgo = formatTimeAgo(item.receivedAt);

  if (item.itemType === "image") {
    // Use convertFileSrc for local file paths, or raw URL for data URLs
    const imgSrc =
      item.content.startsWith("data:") || item.content.startsWith("http")
        ? item.content
        : convertFileSrc(item.content);

    return (
      <div className="group flex items-start gap-2 rounded-md border bg-card p-2">
        <div className="size-12 shrink-0 overflow-hidden rounded border">
          <img
            src={imgSrc}
            alt="Shared image"
            className="size-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a1a1aa'><rect width='24' height='24' rx='4'/></svg>";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            Image • {timeAgo}
          </p>
        </div>
      </div>
    );
  }

  // Text item
  return (
    <div className="group flex items-start gap-2 rounded-md border bg-card p-2">
      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm">
          {item.content}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
        title="Copy text"
        onClick={copyContent}
      >
        {copied ? (
          <span className="text-xs text-green-600">Copied!</span>
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return "just now";
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  } catch {
    return "recently";
  }
}
