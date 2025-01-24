import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2, CloudIcon, HardDriveIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JsonViewer from "@/components/JsonViewer";
import { CopyButton } from "@/components/ui/copy-button";
import { APIResponseCard } from "@/modules/api-connect/components/APIResponseCard";
import { cn } from "@/lib/utils";
import { TranscriptService } from "@/services/transcriptService";
import { transcriptStorageService, LocalTranscript } from "@/services/transcriptStorageService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface Transcript {
  id: string;
  timestamp: string;
  flowId: string;
  flowName: string;
  transcript: string;
  response: any;
  audioUrl?: string;
  apiForwardResult: any;
  storageType: 'local' | 'cloud';
}

const Transcripts = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadTranscripts = async () => {
      try {
        // Get local transcripts and ensure they match Transcript interface
        const localTranscripts = transcriptStorageService.getLocalTranscripts().map(t => ({
          ...t,
          apiForwardResult: t.apiForwardResult || {},
          storageType: 'local' as const
        }));
        
        // Get cloud transcripts if user is logged in
        let cloudTranscripts: Transcript[] = [];
        if (user) {
          const supabaseTranscripts = await TranscriptService.getTranscripts(user.id);
          cloudTranscripts = supabaseTranscripts.map(t => ({
            id: t.id?.toString() || '',
            timestamp: t.created_at || t.timestamp || new Date().toISOString(),
            flowId: t.flow_id,
            flowName: t.flow_name || '',
            transcript: t.transcript,
            response: t.response,
            audioUrl: t.audio_url || undefined,
            apiForwardResult: t.api_forward_result || {},
            storageType: 'cloud' as const
          }));
        }

        // Combine and sort by timestamp
        const allTranscripts = [...localTranscripts, ...cloudTranscripts]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setTranscripts(allTranscripts);
      } catch (error) {
        console.error('Error loading transcripts:', error);
        toast({
          title: "Error",
          description: "Failed to load some transcripts.",
          variant: "destructive",
        });
      }
    };

    loadTranscripts();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
                    Please select a transcript to view details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-y-auto h-[calc(100vh-12rem)]">
                    <div className="space-y-2 p-6">
                      {transcripts.map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg hover:bg-accent cursor-pointer",
                            selectedTranscript?.id === t.id && "bg-accent"
                          )}
                          onClick={() => setSelectedTranscript(t)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {t.storageType === 'cloud' ? (
                                <CloudIcon className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <HardDriveIcon className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">
                                {t.response?.theFlowTitle || t.flowName || new Date(t.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {t.transcript}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
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
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Transcript Selected</h2>
                  <p className="text-sm text-muted-foreground">
                    Please select a transcript from the list to view its details
                  </p>
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