import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFlows } from "@/utils/flowManager";
import { Flow } from "@/utils/storage";
import { AudioRecorder } from "@/utils/audioRecorder";
import { transcribeAudio } from "@/utils/openai";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JsonViewer from "@/components/JsonViewer";
import { ProcessingDialog } from "@/components/ProcessingDialog";
import { AudioVisualizer } from "@/components/recorder/AudioVisualizer";
import { RecordingTimer } from "@/components/recorder/RecordingTimer";
import { CopyButton } from "@/components/ui/copy-button";
import { useAPIForward } from "@/modules/api-connect/hooks/useAPIForward";
import { APIResponseCard } from "@/modules/api-connect/components/APIResponseCard";
import { AudioPreview } from "@/components/recorder/AudioPreview";
import { useAuth } from "@/hooks/useAuth"; 
import { TranscriptService } from "@/services/transcriptService"; // Fix useAuth import path

const audioRecorder = new AudioRecorder();

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioInfo, setAudioInfo] = useState<{ size: string; duration: string } | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [isLoadingFlows, setIsLoadingFlows] = useState(true);
  const { toast } = useToast();
  const { apiResult, isForwarding, forwardResponse } = useAPIForward();
  const { user } = useAuth();

  useEffect(() => {
    async function loadFlows() {
      if (!user) {
        console.log('No user found, skipping flow load');
        setIsLoadingFlows(false);
        return;
      }
      
      try {
        setIsLoadingFlows(true);
        console.log('Loading flows for user:', user.id);
        const flowsList = await getFlows(user.id);
        console.log('Loaded flows:', flowsList);
        setFlows(flowsList);
        
        // If there's only one flow, select it automatically
        if (flowsList.length === 1) {
          setSelectedFlow(flowsList[0]);
        }
      } catch (error) {
        console.error('Error loading flows:', error);
        toast({
          title: "Error",
          description: "Failed to load flows. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFlows(false);
      }
    }
    loadFlows();
  }, [user]);

  const processRecording = async (audioBlob: Blob) => {
    if (!selectedFlow || !user) return;

    try {
      const { transcript, processedResponse } = await transcribeAudio(audioBlob, selectedFlow);
      setTranscript(transcript);
      setResponse(processedResponse);

      // Forward to external API if connection exists
      const forwardResult = await forwardResponse(selectedFlow, processedResponse);

      // Save to Supabase
      try {
        await TranscriptService.createTranscript({
          user_id: user.id,
          flow_id: selectedFlow.id,
          transcript: transcript,
          response: processedResponse || {}, // Ensure it's an object
          audio_url: audioUrl,
          api_forward_result: forwardResult || {} // Ensure it's an object
        });
      } catch (error) {
        console.error('Error saving to Supabase:', error);
        toast({
          title: "Error",
          description: "Failed to save transcript to database.",
          variant: "destructive",
        });
      }

      // Save to localStorage for transcript history (keeping this for backwards compatibility)
      let transcriptHistory;
      try {
        transcriptHistory = JSON.parse(
          localStorage.getItem("transcripts") || "[]"
        );
      } catch (error) {
        console.error('Error parsing transcript history:', error);
        transcriptHistory = [];
      }

      transcriptHistory.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        flowId: selectedFlow.id,
        flowName: selectedFlow.name,
        transcript,
        response: processedResponse,
        audioUrl: audioUrl,
        apiForwardResult: forwardResult
      });

      try {
        localStorage.setItem("transcripts", JSON.stringify(transcriptHistory));
      } catch (error) {
        console.error('Error saving transcript history:', error);
        toast({
          title: "Warning",
          description: "Could not save transcript to local history.",
          variant: "destructive",
        });
      }

      toast({
        title: "Processing completed",
        description: "Your recording has been processed and saved successfully.",
      });
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process recording.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (!selectedFlow) {
      toast({
        title: "Error",
        description: "Please select a flow before recording.",
        variant: "destructive",
      });
      return;
    }

    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setAudioUrl(null);
      setAudioInfo(null);
      setRecordingStartTime(Date.now());
      toast({
        title: "Recording started",
        description: "Your audio is now being recorded.",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    
    try {
      setIsRecording(false); // Set this first to prevent multiple stop attempts
      const audioBlob = await audioRecorder.stopRecording();

      // Calculate file size in MB
      const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(1);
      
      // Calculate duration from start time
      let durationStr = '0m 00s';
      if (recordingStartTime) {
        const durationMs = Date.now() - recordingStartTime;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        durationStr = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
      }
      
      // Create download URL for the audio
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setAudioInfo({ size: `${sizeMB}MB`, duration: durationStr });
      setRecordingStartTime(null);

      setIsProcessing(true);
      toast({
        title: "Recording stopped",
        description: "Processing your recording...",
      });
      await processRecording(audioBlob);
    } catch (error) {
      setIsProcessing(false);
      console.error("Error stopping recording:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop recording.",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full px-1 py-0.5">
      <ProcessingDialog open={isProcessing || isForwarding} />
      {!user ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground">You need to be signed in to record and process audio.</p>
          </div>
        </div>
      ) : isLoadingFlows ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold">Record Audio</h2>
            {flows.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-4">No flows found. Create a flow first to start recording.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col space-y-2">
                  <Select
                    value={selectedFlow?.id || ""}
                    onValueChange={(value) =>
                      setSelectedFlow(flows.find((f) => f.id === value) || null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a flow" />
                    </SelectTrigger>
                    <SelectContent>
                      {flows.map((flow) => (
                        <SelectItem key={flow.id} value={flow.id}>
                          {flow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedFlow?.instructions && (
                    <Card className="bg-muted">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Instructions</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedFlow.instructions}
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      size="lg"
                      className={`rounded-full p-8 cursor-pointer transition-all duration-200 active:scale-95 ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 hover:shadow-lg"
                          : "bg-purple-500 hover:bg-purple-600 hover:shadow-lg"
                      }`}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!selectedFlow}
                    >
                      {isRecording ? (
                        <Square className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                    {isRecording && (
                      <div className="fixed inset-0 bg-red-500/25 pointer-events-none border border-gray-70/5 rounded-full animate-pulse-ring scale-35" />
                    )}
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {!selectedFlow
                        ? "Select a flow to start recording"
                        : isRecording
                        ? "Recording in progress..."
                        : "Click to start recording"}
                    </p>
                    {isRecording && (
                      <div className="grid grid-cols-2 gap-8 w-full">
                        <div className="flex justify-center items-center min-h-[100px]">
                          <AudioVisualizer 
                            isRecording={isRecording}
                            mediaStream={audioRecorder.getMediaStream()}
                          />
                        </div>
                        <div className="flex justify-center items-center min-h-[100px]">
                          <RecordingTimer 
                            startTime={recordingStartTime || 0} 
                            isRecording={isRecording} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {audioUrl && (
                    <AudioPreview audioUrl={audioUrl} audioInfo={audioInfo} />
                  )}

                  {transcript && (
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
                                  The raw transcript from your audio recording.
                                </CardDescription>
                              </div>
                              <CopyButton text={transcript || ''} label="Copy transcript" />
                            </div>
                          </CardHeader>
                          <CardContent className="relative">
                            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent pr-2">
                              <div className="text-sm text-muted-foreground whitespace-pre-line break-words">
                                {transcript || "No transcript available"}
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
                                text={audioInfo ? `Size: ${audioInfo.size}\nDuration: ${audioInfo.duration}` : ''} 
                                label="Copy details" 
                              />
                            </div>
                          </CardHeader>
                          <CardContent>
                            {response ? (
                              <JsonViewer data={response} />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No processed response available
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="airesponse" className="space-y-4">
                        {apiResult && <APIResponseCard result={apiResult} />}
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
                                text={response ? JSON.stringify(response, null, 2) : ''} 
                                label="Copy AI response" 
                              />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {response ? JSON.stringify(response, null, 2) : "No response available"}
                            </pre>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;