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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFlows(getFlows());
  }, []);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/mp3" });
        await processRecording(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
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

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    if (!selectedFlow) return;

    try {
      // Mock transcription for now - in reality, you'd call Whisper API here
      const mockTranscript = "This is a mock transcript of the recording.";
      setTranscript(mockTranscript);

      // Mock AI response based on the flow format
      const mockResponse = JSON.parse(selectedFlow.format);
      setResponse(mockResponse);

      // Save to localStorage for transcript history
      const transcriptHistory = JSON.parse(localStorage.getItem("transcripts") || "[]");
      transcriptHistory.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        flowId: selectedFlow.id,
        flowName: selectedFlow.name,
        transcript: mockTranscript,
        response: mockResponse,
      });
      localStorage.setItem("transcripts", JSON.stringify(transcriptHistory));

      toast({
        title: "Processing completed",
        description: "Your recording has been processed successfully.",
      });
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        title: "Error",
        description: "Failed to process the recording.",
        variant: "destructive",
      });
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
              className={`rounded-full p-8 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-purple-500 hover:bg-purple-600"
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
              <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-red-500" />
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

      {(transcript || response) && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="transcript">
                <AccordionTrigger>Transcript</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-wrap">{transcript}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="response">
                <AccordionTrigger>AI Response</AccordionTrigger>
                <AccordionContent>
                  <pre className="whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;