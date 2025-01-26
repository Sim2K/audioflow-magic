import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import { FlowChatDialogProps } from '../types';
import { ChatSection } from './ChatSection';
import FlowDetailsSection from './FlowDetailsSection';
import { cn } from "@/lib/utils";
import { ChatManager } from '../services/chatManager';

export const FlowChatDialog: React.FC<FlowChatDialogProps> = ({
  isOpen,
  onClose,
  flowDetails,
  onSave
}) => {
  const [details, setDetails] = useState(flowDetails);
  const [showChat, setShowChat] = useState(true); 

  const handleDetailsUpdate = (updatedDetails: any) => {
    setDetails(updatedDetails);
  };

  const handleSave = () => {
    if (!flowDetails || !details) return;
    
    const updatedFlow = {
      ...flowDetails,  // Keep existing flow data
      ...details,      // Update with new details
      id: flowDetails.id  // Ensure we keep the same ID
    };
    
    onSave(updatedFlow);
    onClose();
  };

  const handleMessage = async (message: string) => {
    try {
      const chatManager = ChatManager.getInstance();
      const response = await chatManager.sendMessage(message);
      
      if (response?.FlowData) {
        const updatedDetails = {
          ...details,
          name: response.FlowData.Name?.value || details.name,
          instructions: response.FlowData.Instructions?.value || details.instructions,
          promptTemplate: response.FlowData.PromptTemplate?.value || details.promptTemplate,
          formatTemplate: response.FlowData.FormatTemplate?.value || details.formatTemplate
        };
        setDetails(updatedDetails);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[75vw] w-full">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Flow Chat</DialogTitle>
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
            <ChatSection onSendMessage={handleMessage} />
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

export default FlowChatDialog;
