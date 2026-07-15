import type { ProjectSkill, Skill } from "@workspace/types";
import { getConnection } from "./client";
import catalog from "../skills.json" with { type: "json" };

/** Return the full skills catalog (from the static JSON file). */
export function getSkillsCatalog(): Skill[] {
  return catalog as Skill[];
}

/** Look up a single skill by id. */
export function getSkill(id: string): Skill | undefined {
  return (catalog as Skill[]).find((s) => s.id === id);
}

interface ProjectSkillRow {
  project_id: string;
  skill_id: string;
  added_at: string;
}

function toDomain(row: ProjectSkillRow): ProjectSkill {
  return {
    projectId: row.project_id,
    skillId: row.skill_id,
    addedAt: row.added_at,
  };
}

function now(): string {
  return new Date().toISOString();
}

/** Return all skills that have been added to a project. */
export async function getProjectSkills(
  projectId: string,
): Promise<ProjectSkill[]> {
  const db = await getConnection();
  const rows = await db.select<ProjectSkillRow[]>(
    "SELECT project_id, skill_id, added_at FROM project_skills WHERE project_id = $1 ORDER BY added_at DESC",
    [projectId],
  );
  return rows.map(toDomain);
}

/** Mark a skill as added to a project. Returns the new row. */
export async function addProjectSkill(
  projectId: string,
  skillId: string,
): Promise<ProjectSkill> {
  const db = await getConnection();
  const row: ProjectSkill = {
    projectId,
    skillId,
    addedAt: now(),
  };
  await db.execute(
    "INSERT OR IGNORE INTO project_skills (project_id, skill_id, added_at) VALUES ($1, $2, $3)",
    [row.projectId, row.skillId, row.addedAt],
  );
  return row;
}

/** Remove a skill from a project. */
export async function removeProjectSkill(
  projectId: string,
  skillId: string,
): Promise<void> {
  const db = await getConnection();
  await db.execute(
    "DELETE FROM project_skills WHERE project_id = $1 AND skill_id = $2",
    [projectId, skillId],
  );
}
