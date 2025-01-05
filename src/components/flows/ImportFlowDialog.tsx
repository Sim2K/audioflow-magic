import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Flow } from "@/utils/storage";
import { defaultValues } from "./FlowDialog";

interface ImportFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: Partial<Flow>) => void;
}

export function ImportFlowDialog({
  open,
  onOpenChange,
  onImport,
}: ImportFlowDialogProps) {
  const [importText, setImportText] = useState("");

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.audio_flow) {
        const { output_format, format, ...rest } = parsed.audio_flow;
        onImport({
          ...rest,
          format: format ? JSON.stringify(format) : 
                 output_format ? JSON.stringify(output_format) : 
                 defaultValues.format
        });
        setImportText("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to parse import JSON:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Flow</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your flow JSON here... the 'Flow help' button will enable you work with ChatGPT to create your own personalized flow. Click the 'Flow help' button on the previous page to get started."
            className="font-mono min-h-[200px] resize-none"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
