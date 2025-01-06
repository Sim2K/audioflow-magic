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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-1 gap-2 border-b">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Flows</h1>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none justify-center">
            <a href="https://gpts4u.com/aiaudioflows" target="_blank" rel="noopener noreferrer">
              <Sparkles className="h-4 w-4 mr-2" />
              Flow Help
            </a>
          </Button>
          <Button onClick={onNewFlow} size="sm" className="flex-1 sm:flex-none justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add new flow
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-1 py-0.5">
          <div className={cn(
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
              "bg-white rounded-lg p-2",
              isMobileView && !selectedFlow ? "hidden" : "block",
              "md:block"
            )}>
              <div className="space-y-3">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFlowSelect(null)}
                    className="flex items-center -ml-2 text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Flows
                  </Button>
                )}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedFlow.name}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(selectedFlow)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Flow
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Endpoint</h3>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {selectedFlow.endpoint}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Instructions</h3>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {selectedFlow.instructions || "No instructions provided"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Prompt Template</h3>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {selectedFlow.prompt}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Format Template</h3>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {selectedFlow.format}
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
