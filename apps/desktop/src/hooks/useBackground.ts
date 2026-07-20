import { useCallback, useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type { BackgroundConfig } from "@workspace/types";
import { DEFAULT_BACKGROUND_CONFIG } from "@workspace/types";

const STORAGE_KEY = "app-background-config";

function load(): BackgroundConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults so new fields never cause crashes
      return { ...DEFAULT_BACKGROUND_CONFIG, ...parsed };
    }
  } catch {
    // corrupted — reset
  }
  return { ...DEFAULT_BACKGROUND_CONFIG };
}

function save(config: BackgroundConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export type FileTypeFilter = "image" | "video" | "both";

export function useBackground() {
  const [config, setConfig] = useState<BackgroundConfig>(load);

  // Persist on every change
  useEffect(() => {
    save(config);
  }, [config]);

  /** Pick an image or video file via the OS file dialog. */
  const pickFile = useCallback(async (filter: FileTypeFilter) => {
    let filters: { name: string; extensions: string[] }[];

    switch (filter) {
      case "image":
        filters = [
          { name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "avif", "gif", "bmp", "svg"] },
        ];
        break;
      case "video":
        filters = [
          { name: "Videos", extensions: ["mp4", "webm", "avi", "mov", "mkv", "m4v"] },
        ];
        break;
      case "both":
        filters = [
          { name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "avif", "gif", "bmp", "svg"] },
          { name: "Videos", extensions: ["mp4", "webm", "avi", "mov", "mkv", "m4v"] },
        ];
        break;
    }

    const selected = await open({
      multiple: false,
      filters,
    });

    if (selected) {
      const path = selected as string;
      const isVideo = /\.(mp4|webm|avi|mov|mkv|m4v)$/i.test(path);
      setConfig((prev) => ({
        ...prev,
        src: path,
        enabled: true,
        type: isVideo ? "video" : "image",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setConfig({ ...DEFAULT_BACKGROUND_CONFIG });
  }, []);

  const update = useCallback(
    (patch: Partial<BackgroundConfig>) => {
      setConfig((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  return {
    config,
    setConfig,
    pickFile,
    reset,
    update,
  };
}
