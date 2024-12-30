import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Flow } from "@/utils/storage";
import { getFlows, saveFlow, deleteFlow } from "@/utils/flowManager";
import { Pencil, Trash2 } from "lucide-react";

type FlowFormData = Omit<Flow, "id">;

const Flows = () => {
  const [flows, setFlows] = useState<Flow[]>(getFlows());
  const [editingFlow, setEditingFlow] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FlowFormData>({
    defaultValues: {
      name: "",
      endpoint: "",
      format: "{ 'summary': { 'title': '', 'content': '' } }",
      prompt: "Summarize the following transcript: {transcript}",
    },
  });

  const onSubmit = (data: FlowFormData) => {
    try {
      saveFlow(data, editingFlow);
      setFlows(getFlows());
      toast({
        title: "Success",
        description: `Flow ${editingFlow ? "updated" : "created"} successfully`,
      });
      setIsOpen(false);
      form.reset();
      setEditingFlow(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save flow",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (flow: Flow) => {
    setEditingFlow(flow.id);
    form.reset(flow);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    try {
      deleteFlow(id);
      setFlows(getFlows());
      toast({
        title: "Success",
        description: "Flow deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete flow",
        variant: "destructive",
      });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setEditingFlow(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Automation Flows</CardTitle>
            <CardDescription>
              Create and manage your automation flows here
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>Add Flow</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingFlow ? "Edit Flow" : "Create Flow"}
                </DialogTitle>
                <DialogDescription>
                  Configure your automation flow here. Click save when you're done.
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
                        <FormDescription>
                          A name to identify your flow
                        </FormDescription>
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
                          Where to send the processed data
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
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          JSON format for the response
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Prompt template for OpenAI (use {"{transcript}"} for the
                          transcribed text)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Save Flow</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {flows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No flows available. Click "Add Flow" to create one.
            </p>
          ) : (
            flows.map((flow) => (
              <Card key={flow.id}>
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {flow.prompt}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(flow)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(flow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Flows;