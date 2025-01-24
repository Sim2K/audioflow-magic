import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Link2 } from "lucide-react";
import { Flow } from "@/utils/storage";
import { cn } from "@/lib/utils";

interface FlowCardProps {
  flow: Flow;
  onEdit: (flow: Flow) => void;
  onDelete: (id: string) => void;
  onAPIConnect?: (flow: Flow) => void;
  detailed?: boolean;
}

export function FlowCard({ flow, onEdit, onDelete, onAPIConnect, detailed = false }: FlowCardProps) {
  return (
    <Card className={cn("h-full flex flex-col", detailed ? "shadow-none border-0" : "")}>
      <CardHeader className="flex-none">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Name: {flow.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onAPIConnect && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onAPIConnect(flow)}
                className="h-9 w-9 sm:h-8 sm:w-8"
              >
                <Link2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(flow)}
              className="h-9 w-9 sm:h-8 sm:w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(flow.id)}
              className="h-9 w-9 sm:h-8 sm:w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Format Template</h3>
            <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
              {flow.format}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Prompt Template</h3>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md break-words">
              {flow.prompt}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}