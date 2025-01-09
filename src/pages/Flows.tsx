import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Flow } from "@/utils/storage";
import { getFlows, saveFlow, deleteFlow } from "@/utils/flowManager";
import { FlowDialog } from "@/components/flows/FlowDialog";
import { FlowBoard } from "@/components/flows/FlowBoard";

const Flows = () => {
  const [flows, setFlows] = useState<Flow[]>(getFlows());
  const [editingFlow, setEditingFlow] = useState<string | undefined>();
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setSelectedFlow(null);
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
    <div className="h-full flex flex-col bg-gray-50/40 dark:bg-gray-800/40">
      <div className="pt-4">
        <FlowBoard
          flows={flows}
          onFlowSelect={setSelectedFlow}
          onNewFlow={() => setIsOpen(true)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedFlow={selectedFlow}
          isMobileView={isMobileView}
        />
      </div>
      
      <div className="pt-4">
        <FlowDialog
          open={isOpen}
          onOpenChange={handleDialogOpenChange}
          onSubmit={onSubmit}
          editingFlow={editingFlow ? flows.find(f => f.id === editingFlow) : undefined}
        />
      </div>
    </div>
  );
};

export default Flows;