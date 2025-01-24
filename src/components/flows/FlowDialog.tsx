import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Flow } from "@/utils/storage";
import { useEffect, useState } from "react";
import { ImportFlowDialog } from "./ImportFlowDialog";

interface FlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Flow, "id">) => void;
  editingFlow?: Flow;
}

export const defaultValues = {
  name: "",
  format: '{ "details": { "title": "", "summary": "", "valid_points": [] } }',
  prompt: "Summarize the following transcript: {transcript} in painstaking detail revealing as many facts as possible and using logic to bring out assumptions that can be logically explained.",
  instructions: "",
};

export function FlowDialog({
  open,
  onOpenChange,
  onSubmit,
  editingFlow,
}: FlowDialogProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const form = useForm<Omit<Flow, "id">>({
    defaultValues: editingFlow || defaultValues,
  });

  useEffect(() => {
    if (editingFlow) {
      form.reset(editingFlow);
    } else {
      form.reset(defaultValues);
    }
  }, [editingFlow, form]);

  const handleImport = (importedData: Partial<Flow>) => {
    form.reset({
      name: importedData.name || "",
      instructions: importedData.instructions || "",
      prompt: importedData.prompt || defaultValues.prompt,
      format: importedData.format || defaultValues.format,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[95%] sm:w-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              size="sm"
            >
              Import Flow
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
            >
              <a href="https://gpts4u.com/aiaudioflows" target="_blank" rel="noopener noreferrer">Flow Help</a>
            </Button>
          </div>
        </div>
        <div className="text-center mb-6">
          <DialogTitle>{editingFlow ? "Edit Flow" : "Create Flow"}</DialogTitle>
          <DialogDescription>
            Configure your automation flow here or click "Import Flow" to import an existing flow. The "Flow Help" button will enable you work with ChatGPT to create your own personalized flow, it will do all the hard work for you. Click the "Flow Help" button to get started.
          </DialogDescription>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Flow" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem className="md:row-span-2">
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter instructions for using this flow..."
                        className="min-h-[100px] h-full resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Instructions for users on how to use this flow when recording
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 mt-14">
                    <FormLabel>Prompt Template</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      Use {"{transcript}"} as placeholder for the transcript text
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Format Template</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Format template"
                        className="font-mono min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {editingFlow ? "Save Changes" : "Create Flow"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <ImportFlowDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          onImport={handleImport}
        />
      </DialogContent>
    </Dialog>
  );
}