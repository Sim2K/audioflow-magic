import { Flow } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="space-y-2">
      {flows.map((flow) => (
        <div
          key={flow.id}
          className={cn(
            "group p-4 rounded-lg border bg-white cursor-pointer transition-colors",
            "hover:border-primary/20 hover:bg-primary/5",
            selectedFlow?.id === flow.id && "border-primary/30 bg-primary/10"
          )}
          onClick={() => onFlowSelect(flow)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{flow.name}</h3>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {flow.endpoint}
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(flow.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
