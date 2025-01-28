import { FlowDataType } from '@/types/chat';

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

export interface FlowChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flowDetails: FlowDetails;
  onSave: (updatedFlow: FlowDetails) => void;
  flowChatBlank?: boolean;
}

export interface ChatProps {
  onSendMessage: (flowData: FlowDataType) => void;
  flowDetails?: FlowDetails;
}

export interface FlowDetailsSectionProps {
  details: FlowDetails;
  onUpdate: (details: FlowDetails) => void;
}
