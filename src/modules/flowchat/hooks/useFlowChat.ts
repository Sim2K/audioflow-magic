import { useState, useCallback } from 'react';
import { FlowDetails } from '../types';

export const useFlowChat = (initialFlow?: FlowDetails) => {
  const [flowDetails, setFlowDetails] = useState<FlowDetails | undefined>(initialFlow);

  const updateFlow = useCallback((updatedFlow: FlowDetails) => {
    setFlowDetails(updatedFlow);
  }, []);

  const handleMessage = useCallback(async (message: string) => {
    console.log('Message received:', message);
    // Message handling will be implemented by the parent component
  }, []);

  return {
    flowDetails,
    updateFlow,
    handleMessage
  };
};

export default useFlowChat;
