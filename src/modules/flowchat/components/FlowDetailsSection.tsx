import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FlowDetailsProps } from '../types';

export const FlowDetailsSection: React.FC<FlowDetailsProps> = ({
  details,
  onUpdate
}) => {
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate({
      ...details,
      [field]: event.target.value
    });
  };

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={details?.name || ''}
            onChange={handleChange('name')}
          />
        </div>

        <div className="space-y-2">
          <Label>Instructions</Label>
          <Textarea
            value={details?.instructions || ''}
            onChange={handleChange('instructions')}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Prompt Template</Label>
          <Textarea
            value={details?.prompt || ''}
            onChange={handleChange('prompt')}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Format Template</Label>
          <Textarea
            value={details?.format || ''}
            onChange={handleChange('format')}
            className="min-h-[80px]"
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default FlowDetailsSection;
