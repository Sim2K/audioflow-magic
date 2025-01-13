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
import { APIResponseCard } from "@/modules/api-connect/components/APIResponseCard";

interface Transcript {
  id: string;
  timestamp: string;
  flowId: string;
  flowName: string;
  transcript: string;
  response: any;
  audioUrl?: string;
  apiForwardResult: any;
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

  // Helper function to get display title
  const getTranscriptTitle = (transcript: Transcript) => {
    return transcript.response?.theFlowTitle || 
           transcript.flowName || 
           new Date(transcript.timestamp).toLocaleString();
  };

  if (selectedTranscript) {
    return (
      <div className="flex flex-col h-full px-1 py-0.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-1 gap-2 border-b">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTranscript(null)}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-semibold">
              {getTranscriptTitle(selectedTranscript)}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(selectedTranscript.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="pt-4">
          <Card>
            <div className="pt-4">
              <CardContent>
                <Tabs defaultValue="transcript" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="airesponse">AI Response</TabsTrigger>
                  </TabsList>
                  <TabsContent value="transcript" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Transcript</CardTitle>
                            <CardDescription>
                              The raw transcript from your audio recording
                            </CardDescription>
                          </div>
                          <CopyButton text={selectedTranscript.transcript || ''} label="Copy transcript" />
                        </div>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent pr-2">
                          <div className="text-sm text-muted-foreground whitespace-pre-line break-words">
                            {selectedTranscript.transcript || "No transcript available"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="details" className="space-y-4">
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
                            text={`Flow: ${selectedTranscript.flowName}\nCreated: ${new Date(selectedTranscript.timestamp).toLocaleString()}`} 
                            label="Copy details" 
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        {selectedTranscript?.response ? (
                          <JsonViewer 
                            data={selectedTranscript.response}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No processed response available
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="airesponse" className="space-y-4">
                    {selectedTranscript.apiForwardResult ? (
                      <APIResponseCard result={selectedTranscript.apiForwardResult} />
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>API Forward Response</CardTitle>
                          <CardDescription>No API forward response available</CardDescription>
                        </CardHeader>
                      </Card>
                    )}
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
                            text={selectedTranscript.response ? JSON.stringify(selectedTranscript.response, null, 2) : ''} 
                            label="Copy AI response" 
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedTranscript.response ? JSON.stringify(selectedTranscript.response, null, 2) : "No response available"}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
          </Card>
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
          View your transcript history
        </p>
      </div>

      <div className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Transcript History</CardTitle>
            <CardDescription>
              Select a transcript to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transcripts.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => setSelectedTranscript(t)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {getTranscriptTitle(t)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTranscript(t.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {transcripts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No transcripts available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transcripts;