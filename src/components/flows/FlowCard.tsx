import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Flow } from "@/utils/storage";

interface FlowCardProps {
  flow: Flow;
  onEdit: (flow: Flow) => void;
  onDelete: (id: string) => void;
}

export function FlowCard({ flow, onEdit, onDelete }: FlowCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{flow.name}</CardTitle>
        <CardDescription className="truncate">
          Endpoint: {flow.endpoint}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Format:</span>
            <pre className="mt-1 text-sm bg-muted p-2 rounded-md overflow-x-auto">
              {flow.format}
            </pre>
          </div>
          <div>
            <span className="font-medium">Prompt:</span>
            <p className="mt-1 text-sm text-muted-foreground">{flow.prompt}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(flow)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onDelete(flow.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}