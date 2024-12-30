import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RecordingResultsProps {
  transcript: string;
  response: any;
}

export function RecordingResults({ transcript, response }: RecordingResultsProps) {
  if (!transcript && !response) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      {transcript && (
        <AccordionItem value="transcript">
          <AccordionTrigger>Transcript</AccordionTrigger>
          <AccordionContent>
            <p className="whitespace-pre-wrap">{transcript}</p>
          </AccordionContent>
        </AccordionItem>
      )}
      {response && (
        <AccordionItem value="response">
          <AccordionTrigger>AI Response</AccordionTrigger>
          <AccordionContent>
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}