import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Transcript {
  id: string;
  timestamp: string;
  flowId: string;
  flowName: string;
  transcript: string;
  response: any;
}

const Transcripts = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  useEffect(() => {
    const savedTranscripts = JSON.parse(localStorage.getItem("transcripts") || "[]");
    setTranscripts(savedTranscripts.reverse()); // Show newest first
  }, []);

  const downloadTranscript = (transcript: Transcript) => {
    const data = JSON.stringify(
      {
        timestamp: transcript.timestamp,
        flowName: transcript.flowName,
        transcript: transcript.transcript,
        response: transcript.response,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${transcript.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transcripts</CardTitle>
          <CardDescription>
            View and download your recorded transcripts and AI responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transcripts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transcripts available. Record something to see it here.
            </p>
          ) : (
            transcripts.map((transcript) => (
              <Card key={transcript.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{transcript.flowName}</CardTitle>
                    <CardDescription>
                      {new Date(transcript.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => downloadTranscript(transcript)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="transcript">
                      <AccordionTrigger>Transcript</AccordionTrigger>
                      <AccordionContent>
                        <p className="whitespace-pre-wrap">{transcript.transcript}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="response">
                      <AccordionTrigger>AI Response</AccordionTrigger>
                      <AccordionContent>
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(transcript.response, null, 2)}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transcripts;