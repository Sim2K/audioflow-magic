import { Flow } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <Card className="h-full border-0">
      <CardHeader className="bg-background pt-0">
        <CardTitle>Flow List</CardTitle>
        <CardDescription>Select a flow to view details</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-y-auto h-[calc(100vh-12rem)]">
          <div className="space-y-2 p-6">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                  selectedFlow?.id === flow.id && "bg-accent"
                )}
                onClick={() => onFlowSelect(flow)}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-sm font-medium break-words md:truncate">{flow.name}</h3>
                  <p className="text-xs text-muted-foreground break-words md:truncate">
                    {flow.endpoint}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>
      </CardContent>
    </Card>
  );
}
