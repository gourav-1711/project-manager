import { useState } from "react";
import { Button } from "@workspace/ui";
import { Tabs } from "@/components/Tabs";
import { TodosTab } from "@/components/TodosTab";
import { ErrorsTab } from "@/components/ErrorsTab";
import { SkillsTab } from "@/components/SkillsTab";
import { TimelineTab } from "@/components/TimelineTab";
import { ShareDialog } from "@/components/ShareDialog";
import { ArrowLeft, Share2 } from "lucide-react";
import type { Project } from "@workspace/types";

const SECTIONS = [
  { id: "todos", label: "Todos" },
  { id: "errors", label: "Errors" },
  { id: "skills", label: "Skills" },
  { id: "timeline", label: "Timeline" },
];

export function ProjectDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("todos");
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} title="Back to list">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{project.name}</h2>
          <p className="truncate text-xs text-muted-foreground">{project.path}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="size-4" />
          Share
        </Button>
      </div>

      <Tabs active={activeTab} onChange={setActiveTab} tabs={SECTIONS} />

      <div role="tabpanel">
        {activeTab === "todos" && <TodosTab projectId={project.id} />}
        {activeTab === "errors" && <ErrorsTab projectId={project.id} />}
        {activeTab === "skills" && <SkillsTab projectId={project.id} />}
        {activeTab === "timeline" && <TimelineTab projectId={project.id} />}
      </div>

      <ShareDialog
        project={project}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </div>
  );
}
