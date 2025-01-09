import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JsonViewer from "@/components/JsonViewer";
import { CopyButton } from "@/components/ui/copy-button";

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
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);

  useEffect(() => {
    const savedTranscripts = JSON.parse(localStorage.getItem("transcripts") || "[]");
    setTranscripts(savedTranscripts.reverse()); // Show newest first
  }, []);

  const deleteTranscript = (id: string) => {
    const updatedTranscripts = transcripts.filter((t) => t.id !== id);
    localStorage.setItem("transcripts", JSON.stringify(updatedTranscripts));
    setTranscripts(updatedTranscripts);
    if (selectedTranscript?.id === id) {
      setSelectedTranscript(null);
    }
  };

  if (selectedTranscript) {
    return (
      <div className="flex flex-col h-full px-1 py-0.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-1 gap-2 border-b">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold">
              {selectedTranscript.response.theFlowTitle || selectedTranscript.flowName}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            View your recorded transcripts and AI responses
          </p>
        </div>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedTranscript(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Button>
          
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="response">AI Response</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript" className="mt-2 sm:mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transcript</CardTitle>
                      <CardDescription>
                        The raw transcript from your audio recording
                      </CardDescription>
                    </div>
                    <CopyButton text={selectedTranscript?.transcript || ''} label="Copy transcript" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent pr-2">
                    <div className="text-sm text-muted-foreground whitespace-pre-line break-words">
                      {selectedTranscript.transcript}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-2 sm:mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Details</CardTitle>
                      <CardDescription>
                        Recording details and metadata
                      </CardDescription>
                    </div>
                    <CopyButton 
                      text={selectedTranscript ? 
                        `Flow: ${selectedTranscript.flowName}\nCreated: ${new Date(selectedTranscript.timestamp).toLocaleString()}` 
                        : ''
                      } 
                      label="Copy details" 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <JsonViewer data={selectedTranscript.response} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="response" className="mt-2 sm:mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AI Response</CardTitle>
                      <CardDescription>
                        AI-processed response based on your selected flow
                      </CardDescription>
                    </div>
                    <CopyButton 
                      text={selectedTranscript?.response ? JSON.stringify(selectedTranscript.response, null, 2) : ''} 
                      label="Copy AI response" 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(selectedTranscript.response, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-1 py-0.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-1 gap-2 border-b">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold">Transcripts</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          View your recorded transcripts and AI responses
        </p>
      </div>

      <div className="pt-4">
        <Card>
          <div className="pt-4">
            <CardContent>
              {transcripts.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No transcripts available. Record something to see it here.
                </div>
              ) : (
                <div className="grid gap-4">
                  {transcripts.map((transcript) => (
                    <div
                      key={transcript.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setSelectedTranscript(transcript)}
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">
                          {transcript.response.theFlowTitle || transcript.flowName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transcript.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTranscript(transcript.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Transcripts;