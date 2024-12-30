import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RecordingResults } from "@/components/recorder/RecordingResults";
import { transcribeAudio } from "@/utils/openai";

const audioRecorder = new AudioRecorder();

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFlows(getFlows());
  }, []);

  const processRecording = async (audioBlob: Blob) => {
    if (!selectedFlow) return;

    try {
      // Call Whisper API to transcribe the audio
      const transcript = await transcribeAudio(audioBlob);
      setTranscript(transcript);

      // Process the transcript according to the flow format
      let flowFormat;
      try {
        flowFormat = JSON.parse(selectedFlow.format);
      } catch (error) {
        console.error('Error parsing flow format:', error);
        throw new Error('Invalid flow format. Please check the flow configuration.');
      }

      const response = {
        ...flowFormat,
        transcript
      };
      setResponse(response);

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
        response,
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio Recorder</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Select
            value={selectedFlow?.id}
            onValueChange={(value) => {
              const flow = flows.find((f) => f.id === value);
              setSelectedFlow(flow || null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a flow" />
            </SelectTrigger>
            <SelectContent>
              {flows.length === 0 ? (
                <SelectItem value="none" disabled>
                  No flows available. Please create one first.
                </SelectItem>
              ) : (
                flows.map((flow) => (
                  <SelectItem key={flow.id} value={flow.id}>
                    {flow.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <div className="relative">
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
          <p className="text-sm text-muted-foreground">
            {!selectedFlow
              ? "Select a flow to start recording"
              : isRecording
              ? "Recording in progress..."
              : "Click to start recording"}
          </p>
        </CardContent>
      </Card>

      <RecordingResults transcript={transcript} response={response} />
    </div>
  );
};

export default Index;