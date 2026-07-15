import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import {
  getSkillsCatalog,
  getProjectSkills,
  addProjectSkill,
  removeProjectSkill,
  getProject,
} from "@workspace/db";
import type { ProjectSkill, Skill } from "@workspace/types";

interface InstallState {
  [skillId: string]: "idle" | "installing" | "success" | "error";
}

/**
 * Hook for the Skills section.
 *
 * - Loads the static skills catalog
 * - Tracks which skills are installed per project
 * - Handles npx install via the Rust backend
 */
export function useSkills(projectId: string) {
  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [installed, setInstalled] = useState<ProjectSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [installState, setInstallState] = useState<InstallState>({});

  const reload = useCallback(async () => {
    setLoading(true);
    setCatalog(getSkillsCatalog());
    setInstalled(await getProjectSkills(projectId));
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const isInstalled = useCallback(
    (skillId: string) => installed.some((ps) => ps.skillId === skillId),
    [installed],
  );

  const install = useCallback(
    async (skill: Skill) => {
      setInstallState((prev) => ({ ...prev, [skill.id]: "installing" }));

      try {
        const project = await getProject(projectId);
        if (!project) {
          toast.error("Project not found");
          setInstallState((prev) => ({ ...prev, [skill.id]: "idle" }));
          return;
        }

        const result = await invoke<{ success: boolean; error: string | null }>(
          "install_skill",
          {
            request: {
              command: skill.npxCommand,
              cwd: project.path,
            },
          },
        );

        if (result.success) {
          await addProjectSkill(projectId, skill.id);
          setInstalled((prev) => [
            { projectId, skillId: skill.id, addedAt: new Date().toISOString() },
            ...prev,
          ]);
          setInstallState((prev) => ({ ...prev, [skill.id]: "success" }));
          toast.success(`Added "${skill.name}"`);
        } else {
          setInstallState((prev) => ({ ...prev, [skill.id]: "error" }));
          toast.error(`Failed to install "${skill.name}"`, {
            description: result.error ?? "Unknown error",
          });
        }
      } catch (err) {
        setInstallState((prev) => ({ ...prev, [skill.id]: "error" }));
        toast.error(`Failed to install "${skill.name}"`, {
          description: String(err),
        });
      }
    },
    [projectId],
  );

  const uninstall = useCallback(
    async (skillId: string) => {
      try {
        await removeProjectSkill(projectId, skillId);
        setInstalled((prev) => prev.filter((ps) => ps.skillId !== skillId));
        toast.success("Skill removed from project");
      } catch (err) {
        toast.error("Failed to remove skill", { description: String(err) });
      }
    },
    [projectId],
  );

  return {
    catalog,
    installed,
    loading,
    installState,
    isInstalled,
    install,
    uninstall,
    reload,
  };
}
