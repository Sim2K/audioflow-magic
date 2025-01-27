export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
}

export interface FlowDetails {
  id: string;
  name: string;
  instructions: string;
  prompt: string;
  format: string;
}

export interface FlowDetailsProps {
  details: FlowDetails;
  onUpdate: (details: FlowDetails) => void;
}

export interface FlowChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flowDetails: FlowDetails;
  onSave: (updatedFlow: FlowDetails) => void;
}

export interface ChatProps {
  onSendMessage?: (message: string) => void;
}
