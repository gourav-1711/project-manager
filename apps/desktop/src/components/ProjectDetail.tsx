import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button, ShimmerButton } from "@workspace/ui";
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" onClick={onBack} title="Back to list">
            <ArrowLeft className="size-4" />
          </Button>
        </motion.div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{project.name}</h2>
          <p className="truncate text-xs text-muted-foreground">{project.path}</p>
        </div>
        <ShimmerButton
          shimmerColor="rgba(255,255,255,0.2)"
          background="hsl(var(--primary))"
          borderRadius="8px"
          shimmerSize="0.05em"
          className="h-8 gap-1.5 px-3 text-xs font-medium"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="mr-1 size-3.5" />
          Share
        </ShimmerButton>
      </div>

      <Tabs active={activeTab} onChange={setActiveTab} tabs={SECTIONS} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          role="tabpanel"
        >
          {activeTab === "todos" && <TodosTab projectId={project.id} />}
          {activeTab === "errors" && <ErrorsTab projectId={project.id} />}
          {activeTab === "skills" && <SkillsTab projectId={project.id} />}
          {activeTab === "timeline" && <TimelineTab projectId={project.id} />}
        </motion.div>
      </AnimatePresence>

      <ShareDialog
        project={project}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </motion.div>
  );
}
