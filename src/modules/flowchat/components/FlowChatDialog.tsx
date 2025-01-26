import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import { FlowChatDialogProps } from '../types';
import ChatSection from './ChatSection';
import FlowDetailsSection from './FlowDetailsSection';
import { cn } from "@/lib/utils";

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

  const handleMessage = (message: string) => {
    // Here you can implement the chat message handling logic
    console.log('Chat message:', message);
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
              aria-label="Toggle view"
            />
          </div>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-4 h-[500px]">
          <div className={cn(
            "h-full",
            "md:block md:border-r md:pr-4",
            !showChat && "hidden"
          )}>
            <ChatSection onSendMessage={handleMessage} />
          </div>
          <div className={cn(
            "h-full",
            "md:block md:pl-4",
            showChat && "hidden"
          )}>
            <FlowDetailsSection
              details={details}
              onUpdate={handleDetailsUpdate}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="w-full grid md:flex md:justify-end gap-2 grid-cols-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full md:w-auto"
            >
              Close
            </Button>
            <Button
              onClick={handleSave}
              className="w-full md:w-auto"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlowChatDialog;
