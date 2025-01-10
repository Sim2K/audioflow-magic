import { Flow } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FlowListProps {
  flows: Flow[];
  onFlowSelect: (flow: Flow) => void;
  onEdit: (flow: Flow) => void;
  onDelete: (id: string) => void;
  selectedFlow: Flow | null;
}

export function FlowList({
  flows,
  onFlowSelect,
  onEdit,
  onDelete,
  selectedFlow,
}: FlowListProps) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="pt-6">
          <CardContent>
            <div className="space-y-3">
              {flows.map((flow) => (
                <div
                  key={flow.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                    selectedFlow?.id === flow.id && "bg-accent"
                  )}
                  onClick={() => onFlowSelect(flow)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{flow.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {flow.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(flow);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(flow.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
