import { Flow } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Pencil, Sparkles } from "lucide-react";
import { FlowList } from "./FlowList";
import { cn } from "@/lib/utils";

interface FlowBoardProps {
  flows: Flow[];
  onFlowSelect: (flow: Flow) => void;
  onNewFlow: () => void;
  onEdit: (flow: Flow) => void;
  onDelete: (id: string) => void;
  selectedFlow: Flow | null;
  isMobileView: boolean;
}

export function FlowBoard({
  flows,
  onFlowSelect,
  onNewFlow,
  onEdit,
  onDelete,
  selectedFlow,
  isMobileView,
}: FlowBoardProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Flows</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://gpts4u.com/aiaudioflows" target="_blank" rel="noopener noreferrer">
              <Sparkles className="h-4 w-4 mr-2" />
              Flow Help
            </a>
          </Button>
          <Button onClick={onNewFlow} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add new flow
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex gap-4 p-4">
          <div className={cn(
            "flex-1 min-w-[300px] max-w-md",
            isMobileView && selectedFlow ? "hidden" : "block",
            "md:block"
          )}>
            <FlowList
              flows={flows}
              onFlowSelect={onFlowSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              selectedFlow={selectedFlow}
            />
          </div>
          
          {selectedFlow && (
            <div className={cn(
              "flex-1",
              isMobileView && !selectedFlow ? "hidden" : "block",
              "md:block"
            )}>
              <div className="bg-white rounded-lg border p-6 h-full">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    {isMobileView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFlowSelect(null)}
                        className="mb-2 -ml-2 text-muted-foreground"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Flows
                      </Button>
                    )}
                    <h2 className="text-xl font-semibold">{selectedFlow.name}</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(selectedFlow)}
                    className="shrink-0"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Flow
                  </Button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Endpoint</label>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {selectedFlow.endpoint}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Format Template</label>
                    <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                      {selectedFlow.format}
                    </pre>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prompt Template</label>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {selectedFlow.prompt}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
