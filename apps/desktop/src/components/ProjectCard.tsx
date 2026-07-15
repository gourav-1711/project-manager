import { motion } from "motion/react";
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
            className="h-8 gap-1.5 px-2 text-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground active:scale-[0.96]"
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
  index = 0,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onOpen: (project: Project) => void;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      layout
    >
      <Card className="flex flex-col gap-3 border-0 bg-transparent p-4 shadow-none glass-card">
        <CardHeader className="p-0">
          <div className="flex items-center gap-1">
            <CardTitle
              className="min-w-0 flex-1 truncate text-base"
              title={project.name}
            >
              {project.name}
            </CardTitle>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1.5 size-7 shrink-0"
                title="Open project detail"
                onClick={() => onOpen(project)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </motion.div>
          </div>
          <CardDescription className="truncate text-xs" title={project.path}>
            {project.path}
          </CardDescription>
          <CardAction className="flex gap-1">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title="Edit project"
                onClick={() => onEdit(project)}
              >
                <Pencil className="size-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                title="Remove project"
                onClick={() => onDelete(project)}
              >
                <Trash2 className="size-4" />
              </Button>
            </motion.div>
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
    </motion.div>
  );
}
