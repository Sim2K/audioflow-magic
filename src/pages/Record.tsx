import { useState, useEffect } from "react";
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

const audioRecorder = new AudioRecorder();

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFlows(getFlows());
  }, []);

  const processRecording = async (audioBlob: Blob) => {
    if (!selectedFlow) return;

    try {
      // Call Whisper API to transcribe the audio and process with GPT-4
      const { transcript, processedResponse } = await transcribeAudio(audioBlob, selectedFlow);
      setTranscript(transcript);

      // Use the processed response directly
      setResponse(processedResponse);

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
        audioUrl: audioUrl // Save the audio URL with the transcript
      });
      try {
        localStorage.setItem("transcripts", JSON.stringify(transcriptHistory));
      } catch (error) {
        console.error('Error saving transcript history:', error);
      }

      toast({
        title: "Processing completed",
        description: "Your recording has been processed successfully.",
      });
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process the recording.",
        variant: "destructive",
      });
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

      // Create download URL for the audio
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      toast({
        title: "Recording stopped",
        description: "Processing your recording...",
      });
      await processRecording(audioBlob);
    } catch (error) {
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
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Record Audio</CardTitle>
          <CardDescription>
            Select a flow and record your audio for processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

            <div className="flex justify-center gap-4">
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
                <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-red-500 pointer-events-none" />
              )}
            </div>
            {audioUrl && (
              <a
                href={audioUrl}
                download="recording.mp3"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary/80"
              >
                Download Recording
              </a>
            )}
            <p className="text-sm text-muted-foreground">
              {!selectedFlow
                ? "Select a flow to start recording"
                : isRecording
                ? "Recording in progress..."
                : "Click to start recording"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="response">AI Response</TabsTrigger>
        </TabsList>
        <TabsContent value="transcript" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
              <CardDescription>
                The raw transcript from your audio recording.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {transcript || "No transcript available"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                A user-friendly view of the AI-processed response.
              </CardDescription>
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
        <TabsContent value="response" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Response</CardTitle>
              <CardDescription>
                The complete AI-processed response in JSON format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {response ? JSON.stringify(response, null, 2) : "No response available"}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;