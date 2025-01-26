export interface FlowChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flowDetails: any; // Will be typed properly based on your flow structure
  onSave: (flowDetails: any) => void;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'system';
}

export interface FlowDetailsProps {
  details: any;
  onUpdate: (details: any) => void;
}
