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
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getTranscripts, deleteTranscript } from "@/utils/transcriptStorage";
import { useToast } from "@/hooks/use-toast";
import type { TranscriptRecord } from "@/types/transcript";

const Transcripts = () => {
  const [transcripts, setTranscripts] = useState<TranscriptRecord[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptRecord | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!session?.user?.id) {
        setTranscripts([]);
        setIsLoading(false);
        return;
      }

      try {
        const fetchedTranscripts = await getTranscripts(session.user.id);
        setTranscripts(fetchedTranscripts);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
        toast({
          title: "Error",
          description: "Failed to load transcripts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscripts();
  }, [session?.user?.id, toast]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDeleteTranscript = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      await deleteTranscript(id, session.user.id);
      setTranscripts(prev => prev.filter(t => t.id !== id));
      if (selectedTranscript?.id === id) {
        setSelectedTranscript(null);
      }
      toast({
        title: "Success",
        description: "Transcript deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting transcript:', error);
      toast({
        title: "Error",
        description: "Failed to delete transcript",
        variant: "destructive",
      });
    }
  };

  // Helper function to get display title
  const getTranscriptTitle = (transcript: TranscriptRecord) => {
    return transcript.response?.theFlowTitle || 
           new Date(transcript.timestamp).toLocaleString();
  };

  if (!session?.user?.id) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view transcripts</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-30 bg-background">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold">Transcripts</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            View your transcript history
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* List Section - Fixed */}
          <div className={cn(
            isMobileView && selectedTranscript ? "hidden" : "block",
            "md:block w-[400px]"
          )}>
            <div className="fixed w-[400px] top-[4rem] bottom-0 bg-background">
              <Card className="h-full border-0">
                <CardHeader className="bg-background">
                  <CardTitle>Transcript History</CardTitle>
                  <CardDescription>
                    Select a transcript to view details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-y-auto h-[calc(100vh-12rem)]">
                    <div className="space-y-2 p-6">
                      {isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Loading transcripts...
                        </p>
                      ) : transcripts.length > 0 ? (
                        transcripts.map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg hover:bg-accent cursor-pointer",
                              selectedTranscript?.id === t.id && "bg-accent"
                            )}
                            onClick={() => setSelectedTranscript(t)}
                          >
                            <div className="flex-1 min-w-0 mr-2">
                              <h3 className="text-sm font-medium break-words md:truncate">
                                {getTranscriptTitle(t)}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {new Date(t.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTranscript(t.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No transcripts available
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Details Section - Scrollable */}
          <div className={cn(
            "flex-1 min-h-0 overflow-y-auto",
            isMobileView && !selectedTranscript ? "hidden" : "flex-1"
          )}>
            <div className="w-full px-6">
              {selectedTranscript ? (
                <>
                  {isMobileView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTranscript(null)}
                      className="flex items-center -ml-2 text-muted-foreground mb-4"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Transcripts
                    </Button>
                  )}

                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold break-words">
                        {getTranscriptTitle(selectedTranscript)}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedTranscript.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

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
                                    text={`Flow: ${selectedTranscript.response?.theFlowTitle}\nCreated: ${new Date(selectedTranscript.timestamp).toLocaleString()}`} 
                                    label="Copy details" 
                                  />
                                </div>
                              </CardHeader>
                              <CardContent>
                                {selectedTranscript.response ? (
                                  <JsonViewer data={selectedTranscript.response} />
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No processed response available
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="airesponse" className="space-y-4">
                            {selectedTranscript.api_forward_result && (
                              <APIResponseCard result={selectedTranscript.api_forward_result} />
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
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Select a transcript to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transcripts;