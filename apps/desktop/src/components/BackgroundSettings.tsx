import { useCallback, useState } from "react";
import type { BackgroundConfig, BlendMode } from "@workspace/types";
import { BLEND_MODES, BLEND_MODE_LABELS } from "@/lib/background";
import { Image, Video, Trash2, Upload } from "lucide-react";
import type { FileTypeFilter } from "@/hooks/useBackground";
import { PATTERN_OPTIONS } from "@/lib/overlay-patterns";

interface BackgroundSettingsProps {
  config: BackgroundConfig;
  onPickFile: (filter: FileTypeFilter) => void;
  onUpdate: (patch: Partial<BackgroundConfig>) => void;
  onReset: () => void;
}

/* ── Individual control row ── */
function ControlRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = `bg-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
        <span className="text-xs tabular-nums text-muted-foreground/70">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="bg-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/* ── Preset thumbnails ── */

interface Preset {
  label: string;
  config: Partial<BackgroundConfig>;
}

const PRESETS: Preset[] = [
  {
    label: "Soft blur",
    config: { blur: 4, opacity: 0.7, saturation: 1.2, contrast: 1.05, blendMode: "normal" },
  },
  {
    label: "Vibrant glass",
    config: { blur: 8, opacity: 0.85, saturation: 1.8, contrast: 1.1, blendMode: "overlay" },
  },
  {
    label: "Muted matte",
    config: { blur: 2, opacity: 0.4, saturation: 0.6, contrast: 0.9, blendMode: "multiply" },
  },
  {
    label: "Dramatic",
    config: { blur: 12, opacity: 0.9, saturation: 2.0, contrast: 1.3, blendMode: "hard-light" },
  },
  {
    label: "Washed out",
    config: { blur: 6, opacity: 0.5, saturation: 0.3, contrast: 0.85, blendMode: "luminosity" },
  },
  {
    label: "Dreamy",
    config: { blur: 16, opacity: 0.75, saturation: 1.5, contrast: 1.0, blendMode: "soft-light" },
  },
];

/* ── Blend mode selector ── */

function BlendModeSelect({
  value,
  onChange,
}: {
  value: BlendMode;
  onChange: (v: BlendMode) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Blend mode
      </label>
      <select
        className="bg-select"
        value={value}
        onChange={(e) => onChange(e.target.value as BlendMode)}
      >
        {BLEND_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {BLEND_MODE_LABELS[mode]}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── File type chooser step ── */

function FileTypeStep({ onPick }: { onPick: (filter: FileTypeFilter) => void }) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onPick("image")}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm font-medium text-muted-foreground transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-foreground"
      >
        <Image className="size-5" />
        Image
      </button>
      <button
        type="button"
        onClick={() => onPick("video")}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm font-medium text-muted-foreground transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-foreground"
      >
        <Video className="size-5" />
        Video
      </button>
    </div>
  );
}

/* ── Main component ── */

export function BackgroundSettings({
  config,
  onPickFile,
  onUpdate,
  onReset,
}: BackgroundSettingsProps) {
  const [showPresets, setShowPresets] = useState(false);

  const applyPreset = useCallback(
    (preset: Partial<BackgroundConfig>) => {
      onUpdate(preset);
      setShowPresets(false);
    },
    [onUpdate],
  );

  const hasBackground = config.type !== "none" && config.src;

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Background image / video</p>
        {hasBackground && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground/60 transition-colors hover:text-red-400"
          >
            <Trash2 className="size-3" />
            Remove
          </button>
        )}
      </div>

      {!hasBackground ? (
        /* ── No background — show file picker ── */
        <FileTypeStep onPick={onPickFile} />
      ) : (
        /* ── Background active — show controls ── */
        <div className="flex flex-col gap-4">
          {/* Current file + change button */}
          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
              {config.type === "video" ? (
                <Video className="size-5 text-indigo-400" />
              ) : (
                <Image className="size-5 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">
                {config.src.split(/[\\/]/).pop()}
              </p>
              <p className="truncate text-[10px] text-muted-foreground/50">
                {config.src}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPickFile(config.type === "video" ? "video" : "image")}
              className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
            >
              <Upload className="size-3" />
              Change
            </button>
          </div>

          {/* Presets toggle */}
          <button
            type="button"
            onClick={() => setShowPresets((p) => !p)}
            className="self-start rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            {showPresets ? "Hide presets ▲" : "Show presets ▼"}
          </button>

          {/* Preset grid */}
          {showPresets && (
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.config)}
                  className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2 text-[11px] font-medium text-muted-foreground/70 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-foreground"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Controls grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            <ControlRow
              label="Blur"
              value={config.blur}
              min={0}
              max={40}
              step={1}
              unit="px"
              onChange={(v) => onUpdate({ blur: v })}
            />
            <ControlRow
              label="Opacity"
              value={config.opacity}
              min={0.05}
              max={1}
              step={0.05}
              onChange={(v) => onUpdate({ opacity: v })}
            />
            <ControlRow
              label="Saturation"
              value={config.saturation}
              min={0}
              max={3}
              step={0.05}
              onChange={(v) => onUpdate({ saturation: v })}
            />
            <ControlRow
              label="Contrast"
              value={config.contrast}
              min={0}
              max={3}
              step={0.05}
              onChange={(v) => onUpdate({ contrast: v })}
            />
          </div>

          <BlendModeSelect
            value={config.blendMode}
            onChange={(v) => onUpdate({ blendMode: v })}
          />

          {/* ── Overlay pattern section ── */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
            <label className="text-xs font-medium text-muted-foreground">
              Overlay pattern
            </label>
            <select
              className="bg-select"
              value={config.overlayPattern}
              onChange={(e) => onUpdate({ overlayPattern: e.target.value as BackgroundConfig["overlayPattern"] })}
            >
              {PATTERN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {config.overlayPattern !== "none" && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-3 pt-1">
                {config.overlayPattern !== "noise" && (
                  <ControlRow
                    label="Opacity"
                    value={config.overlayOpacity}
                    min={0.05}
                    max={1}
                    step={0.05}
                    onChange={(v) => onUpdate({ overlayOpacity: v })}
                  />
                )}
                <ControlRow
                  label="Scale"
                  value={config.overlayScale}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="×"
                  onChange={(v) => onUpdate({ overlayScale: v })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
