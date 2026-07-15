import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui";
import { TOOL_META, launchTool, type ToolMeta } from "@/lib/launch";
import type { Project } from "@workspace/types";
import { touchLastOpened } from "@workspace/db";
import {
  FolderOpen,
  Terminal,
  Code2,
  Bot,
  Pencil,
  Trash2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const TOOL_ICONS: Record<ToolMeta["id"], LucideIcon> = {
  explorer: FolderOpen,
  terminal: Terminal,
  vscode: Code2,
  cursor: Code2,
  claude: Bot,
};

export function QuickLaunch({ project }: { project: Project }) {
  async function handleLaunch(tool: ToolMeta) {
    const ok = await launchTool(tool, project.path);
    if (ok) {
      // Non-critical — fire-and-forget
      touchLastOpened(project.id).catch(() => {});
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {TOOL_META.map((tool) => {
        const Icon = TOOL_ICONS[tool.id];
        return (
          <Button
            key={tool.id}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs"
            title={tool.label}
            onClick={() => handleLaunch(tool)}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onOpen,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onOpen: (project: Project) => void;
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardHeader className="p-0">
        <div className="flex items-center gap-1">
          <CardTitle
            className="min-w-0 flex-1 truncate text-base"
            title={project.name}
          >
            {project.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1.5 size-7 shrink-0"
            title="Open project detail"
            onClick={() => onOpen(project)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <CardDescription className="truncate text-xs" title={project.path}>
          {project.path}
        </CardDescription>
        <CardAction className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="Edit project"
            onClick={() => onEdit(project)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            title="Remove project"
            onClick={() => onDelete(project)}
          >
            <Trash2 className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-0">
        {project.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
        <QuickLaunch project={project} />
        <p className="text-xs text-muted-foreground">
          {project.lastOpenedAt
            ? `Last opened ${new Date(project.lastOpenedAt).toLocaleString()}`
            : "Never opened"}
        </p>
      </CardContent>
    </Card>
  );
}
