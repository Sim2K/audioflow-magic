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
      <CardHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardTitle>Flow List</CardTitle>
        <CardDescription>Select a flow to view details</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="space-y-2 p-6">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className={cn(
                  "flex items-start gap-2 p-3 rounded-lg hover:bg-accent cursor-pointer overflow-hidden",
                  selectedFlow?.id === flow.id ? "bg-primary/10" : "hover:bg-accent/30"
                )}
                onClick={() => onFlowSelect(flow)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-foreground mb-1">
                    {flow.name}
                  </h3>
                  <p className="text-sm text-muted-foreground/80 line-clamp-2">
                    {flow.instructions || "No description"}
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
            {flows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No flows available
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
