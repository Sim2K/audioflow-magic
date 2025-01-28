import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import ChatSection from './ChatSection';
import FlowDetailsSection from './FlowDetailsSection';
import { cn } from "@/lib/utils";
import { FlowChatDialogProps } from '../types';
import { Flow } from '@/utils/storage';
import { saveFlow } from '@/utils/flowManager';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const FlowChatDialog: React.FC<FlowChatDialogProps> = ({
  isOpen,
  onClose,
  flowDetails,
  onSave,
  flowChatBlank
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const emptyFlow = {
    name: 'My New Flow',
    instructions: 'Just talk about what ever you like.',
    prompt: 'Summarize the following transcript: {transcript} in painstaking detail revealing as many facts as possible and using logic to bring out assumptions that can be logically explained.',
    format: JSON.stringify({
      details: {
        title: "",
        summary: "",
        valid_points: [],
        logical_assumptions: []
      }
    })
  };

  const [details, setDetails] = useState(flowChatBlank ? emptyFlow : flowDetails);
  const [showChat, setShowChat] = useState(true); 
  const [chatKey, setChatKey] = useState(Date.now()); // Add key for chat reset

  // Update details when flowDetails changes or when opening dialog
  useEffect(() => {
    if (flowChatBlank && isOpen) {
      setDetails(emptyFlow);
      setChatKey(Date.now()); // Reset chat
    } else if (!flowChatBlank && flowDetails) {
      setDetails(flowDetails);
    }
  }, [flowDetails, flowChatBlank, isOpen]);

  const handleDetailsUpdate = (updatedDetails: any) => {
    setDetails(updatedDetails);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save flows",
        variant: "destructive",
      });
      return;
    }

    try {
      if (flowChatBlank) {
        // Create new flow
        const newFlow: Omit<Flow, 'id'> = {
          name: details?.name || emptyFlow.name,
          instructions: details?.instructions || emptyFlow.instructions,
          prompt: details?.prompt || emptyFlow.prompt,
          format: details?.format || emptyFlow.format
        };
        const savedFlow = await saveFlow(newFlow, user.id);
        onSave(savedFlow);
        toast({
          title: "Success",
          description: "Flow created successfully",
        });
      } else if (flowDetails && details) {
        // Update existing flow
        const updatedFlow = {
          ...flowDetails,
          ...details,
          id: flowDetails.id
        };
        onSave(updatedFlow);
      }
      onClose();
    } catch (error) {
      console.error('Error saving flow:', error);
      toast({
        title: "Error",
        description: "Failed to save flow",
        variant: "destructive",
      });
    }
  };

  const handleMessage = async (flowData: any) => {
    if (!flowData) return;

    // Update the flow details with the AI suggestions
    setDetails(prev => ({
      ...prev,
      name: flowData.Name?.content || prev.name,
      instructions: flowData.Instructions?.content || prev.instructions,
      prompt: flowData.PromptTemplate?.content || prev.prompt,
      format: flowData.FormatTemplate?.content || prev.format
    }));
  };

  const handleClose = () => {
    onClose();
    // Reset chat by changing key
    setChatKey(Date.now());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[80vw] max-w-[60vw] h-[80vh]" aria-describedby="flow-chat-description">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Flow Chat</DialogTitle>
          <p id="flow-chat-description" className="text-sm text-muted-foreground">
            Configure your audio flow settings
          </p>
          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {showChat ? 'Chat' : 'Settings'}
            </span>
            <Switch
              checked={showChat}
              onCheckedChange={setShowChat}
            />
          </div>
        </DialogHeader>
        
        <div className="flex gap-4 h-[60vh]">
          <div className={cn(
            "flex-1 transition-all",
            !showChat && "hidden md:block"
          )}>
            <ChatSection 
              key={chatKey}
              onSendMessage={handleMessage} 
              flowDetails={details}
              isOpen={isOpen}
              flowChatBlank={flowChatBlank}
            />
          </div>
          
          <div className={cn(
            "w-1/3 transition-all",
            showChat && "hidden md:block"
          )}>
            <FlowDetailsSection
              details={details}
              onUpdate={handleDetailsUpdate}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
