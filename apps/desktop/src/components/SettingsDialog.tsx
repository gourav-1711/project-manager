import { useCallback, useEffect, useState } from "react";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui";
import { SunMoon, MonitorSmartphone } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [autostartOn, setAutostartOn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Read current autostart state when the dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    isEnabled()
      .then((enabled) => {
        if (!cancelled) {
          setAutostartOn(enabled);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const toggleAutostart = useCallback(async () => {
    const next = !autostartOn;
    try {
      if (next) {
        await enable();
      } else {
        await disable();
      }
      setAutostartOn(next);
    } catch (err) {
      // Silently fail — the plugin may not be supported on this OS
      console.warn("Failed to toggle autostart:", err);
    }
  }, [autostartOn]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure app behavior and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── Launch on startup ── */}
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <MonitorSmartphone className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Launch on system startup</p>
                <p className="text-xs text-muted-foreground">
                  Automatically start the app when you log in to your computer.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autostartOn}
              disabled={loading}
              onClick={toggleAutostart}
              className={`
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
                rounded-full border-2 border-transparent transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                focus-visible:ring-offset-2 focus-visible:ring-offset-background
                disabled:cursor-not-allowed disabled:opacity-50
                ${autostartOn ? "bg-primary" : "bg-input"}
              `}
            >
              <span
                className={`
                  pointer-events-none block size-5 rounded-full bg-white shadow-lg
                  ring-0 transition-transform
                  ${autostartOn ? "translate-x-5" : "translate-x-0"}
                `}
              />
            </button>
          </div>

          {/* ── Tray info (read-only) ── */}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
            <SunMoon className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">System tray</p>
              <p className="text-xs text-muted-foreground">
                The app minimizes to the system tray when you close the window.
                Click the tray icon to restore it, or right-click to quit.
              </p>
            </div>
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
