import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import ChatSection from './ChatSection';
import FlowDetailsSection from './FlowDetailsSection';
import { cn } from "@/lib/utils";
import { FlowChatDialogProps } from '../types';

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
    // Message handling will be implemented by parent component
    console.log('Message received:', message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]" aria-describedby="flow-chat-description">
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
