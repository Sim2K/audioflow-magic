import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { FlowChatDialog } from './FlowChatDialog';
import { FlowDetails } from '../types';

interface FlowChatButtonProps {
  flowDetails: FlowDetails;
  onFlowUpdate: (details: FlowDetails) => void;
}

export const FlowChatButton: React.FC<FlowChatButtonProps> = ({
  flowDetails,
  onFlowUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpen = () => setIsDialogOpen(true);
  const handleClose = () => setIsDialogOpen(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpen}
        className="ml-1"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Flow Chat
      </Button>
      <FlowChatDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        flowDetails={flowDetails}
        onSave={onFlowUpdate}
      />
    </>
  );
};

export default FlowChatButton;
