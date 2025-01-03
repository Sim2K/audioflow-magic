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
import { useEffect } from "react";

interface FlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Flow, "id">) => void;
  editingFlow?: Flow;
}

const defaultValues = {
  name: "",
  endpoint: "",
  format: '{ "details": { "title": "", "summary": "", "valid_points": [] } }',
  prompt: "Summarize the following transcript: {transcript} in painstaking detail revealing as many facts as possible and using logic to bring out assumptions that can be logically explained.",
};

export function FlowDialog({
  open,
  onOpenChange,
  onSubmit,
  editingFlow,
}: FlowDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingFlow ? "Edit Flow" : "Create Flow"}</DialogTitle>
          <DialogDescription>
            Configure your automation flow here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.example.com/endpoint"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Where to send the processed data - Future functionality - Placeholder
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Format</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="font-mono resize-y min-h-[50px]"
                    />
                  </FormControl>
                  <FormDescription>JSON format for the response - Leave as is if you don't know what you're doing</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Template</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      className="resize-y min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>Use {"{transcript}"} as placeholder for the transcript text</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {editingFlow ? "Save Changes" : "Create Flow"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}