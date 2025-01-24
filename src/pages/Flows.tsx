import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Flow } from "@/utils/storage";
import { getFlows, saveFlow, deleteFlow } from "@/utils/flowManager";
import { FlowDialog } from "@/components/flows/FlowDialog";
import { FlowBoard } from "@/components/flows/FlowBoard";
import { APIConnectButton } from "@/modules/api-connect/components/APIConnectButton";
import { APIConnectForm } from "@/modules/api-connect/components/APIConnectForm";
import { APIConnection } from "@/modules/api-connect/types/api-connect";
import { useAuth } from "@/hooks/useAuth";

const Flows = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [editingFlow, setEditingFlow] = useState<string | undefined>();
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAPIConnectOpen, setIsAPIConnectOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log('Auth state:', { user, isLoading });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadFlows() {
      if (!user) {
        console.log('No user found, skipping flow load');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Loading flows for user:', user.id);
        const flowsList = await getFlows(user.id);
        console.log('Loaded flows:', flowsList);
        setFlows(flowsList);
      } catch (error) {
        console.error('Error loading flows:', error);
        toast({
          title: "Error",
          description: "Failed to load flows",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadFlows();
  }, [user]);

  const onSubmit = async (data: Omit<Flow, "id">) => {
    if (!user) return;

    try {
      const savedFlow = await saveFlow(data, user.id, editingFlow);
      const updatedFlows = await getFlows(user.id);
      setFlows(updatedFlows);
      toast({
        title: "Success",
        description: `Flow ${editingFlow ? "updated" : "created"} successfully`,
      });
      setIsOpen(false);
      setEditingFlow(undefined);
    } catch (error) {
      console.error('Error saving flow:', error);
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

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      await deleteFlow(id, user.id);
      const updatedFlows = await getFlows(user.id);
      setFlows(updatedFlows);
      if (selectedFlow?.id === id) {
        setSelectedFlow(null);
      }
      toast({
        title: "Success",
        description: "Flow deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast({
        title: "Error",
        description: "Failed to delete flow",
        variant: "destructive",
      });
    }
  };

  const handleAPIConnect = (flow: Flow) => {
    console.log('Opening API Connect dialog for flow:', flow);
    setSelectedFlow(flow);
    setIsAPIConnectOpen(true);
  };

  const handleCloseAPIConnect = () => {
    console.log('Closing API Connect dialog');
    setIsAPIConnectOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      {!user ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground">You need to be signed in to view and manage flows.</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <FlowBoard
            flows={flows}
            onFlowSelect={setSelectedFlow}
            onNewFlow={() => setIsOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAPIConnect={handleAPIConnect}
            selectedFlow={selectedFlow}
            isMobileView={isMobileView}
          />

          <FlowDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={onSubmit}
            editingFlow={flows.find((f) => f.id === editingFlow)}
          />

          {selectedFlow && (
            <APIConnectForm
              key={selectedFlow.id}
              flow={selectedFlow}
              isOpen={isAPIConnectOpen}
              onClose={handleCloseAPIConnect}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Flows;