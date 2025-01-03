import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Flow } from "@/utils/storage";
import { getFlows, saveFlow, deleteFlow } from "@/utils/flowManager";
import { FlowCard } from "@/components/flows/FlowCard";
import { FlowDialog } from "@/components/flows/FlowDialog";

const Flows = () => {
  const [flows, setFlows] = useState<Flow[]>(getFlows());
  const [editingFlow, setEditingFlow] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const onSubmit = (data: Omit<Flow, "id">) => {
    try {
      saveFlow(data, editingFlow);
      setFlows(getFlows());
      toast({
        title: "Success",
        description: `Flow ${editingFlow ? "updated" : "created"} successfully`,
      });
      setIsOpen(false);
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
          <Button onClick={() => setIsOpen(true)}>Add Flow</Button>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-4 md:gap-6">
          {flows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 col-span-full">
              No flows available. Click "Add Flow" to create one.
            </p>
          ) : (
            flows.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </CardContent>
      </Card>

      <FlowDialog
        open={isOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={onSubmit}
        editingFlow={flows.find((f) => f.id === editingFlow)}
      />
    </div>
  );
};

export default Flows;