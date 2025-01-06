import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ProcessingDialogProps {
  open: boolean;
}

export function ProcessingDialog({ open }: ProcessingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing Your Recording
          </DialogTitle>
          <DialogDescription>
            Please don't navigate away from this page while your recording is being processed.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
