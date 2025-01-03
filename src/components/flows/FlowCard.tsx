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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <CardTitle className="text-lg break-words">{flow.name}</CardTitle>
        <CardDescription className="break-all">
          Endpoint: {flow.endpoint}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="space-y-2">
          <div>
            <span className="font-medium">Format:</span>
            <pre className="mt-1 text-sm bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
              {flow.format}
            </pre>
          </div>
          <div>
            <span className="font-medium">Prompt:</span>
            <p className="mt-1 text-sm text-muted-foreground break-words">{flow.prompt}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-none flex justify-end space-x-2">
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
      </CardFooter>
    </Card>
  );
}