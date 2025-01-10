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
  const { toast } = useToast();
  const { apiResult, isForwarding, forwardResponse } = useAPIForward();

  useEffect(() => {
    setFlows(getFlows());
  }, []);

  const processRecording = async (audioBlob: Blob) => {
    if (!selectedFlow) return;

    try {
      const { transcript, processedResponse } = await transcribeAudio(audioBlob, selectedFlow);
      setTranscript(transcript);
      setResponse(processedResponse);

      // Forward to external API if connection exists
      const forwardResult = await forwardResponse(selectedFlow, processedResponse);

      // Save to localStorage for transcript history
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
        apiForwardResult: forwardResult // Save the actual API forward result
      });

      try {
        localStorage.setItem("transcripts", JSON.stringify(transcriptHistory));
      } catch (error) {
        console.error('Error saving transcript history:', error);
        toast({
          title: "Warning",
          description: "Could not save transcript to history.",
          variant: "destructive",
        });
      }

      toast({
        title: "Processing completed",
        description: "Your recording has been processed successfully.",
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-1 gap-2 border-b">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold">Record Audio</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a flow and record your audio for processing
        </p>
      </div>

      <div className="pt-4">
        <Card>
          <div className="pt-4">
            <CardContent>
              <div className="flex flex-col space-y-4">
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
                  {audioUrl && response?.theFlowTitle && (
                    <a
                      href={audioUrl}
                      download={`${response.theFlowTitle.replace(/[^a-zA-Z0-9]/g, '-')}.mp3`}
                      className="text-sm font-medium text-primary hover:text-primary/80"
                    >
                      Download Recording {audioInfo && `(${audioInfo.size} / ${audioInfo.duration})`}
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AudioVisualizer 
                  isRecording={isRecording}
                  mediaStream={audioRecorder.getMediaStream()}
                />
                <RecordingTimer 
                  isRecording={isRecording}
                  startTime={recordingStartTime}
                />
              </div>

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
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;