import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface AudioPreviewProps {
  audioUrl: string | null;
  audioInfo: {
    size: string;
    duration: string;
  } | null;
}

export function AudioPreview({ audioUrl, audioInfo }: AudioPreviewProps) {
  if (!audioUrl || !audioInfo) return null;

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {audioInfo.size} • {audioInfo.duration}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            asChild
          >
            <a href={audioUrl} download="recording.mp3">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </div>
      
      <Alert variant="destructive" className="mt-2">
        <AlertDescription>
          Please download your recording if you want to keep it. The audio file will be lost when you leave this page.
        </AlertDescription>
      </Alert>
    </Card>
  );
}
