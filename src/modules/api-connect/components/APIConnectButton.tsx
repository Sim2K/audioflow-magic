import { Button } from "@/components/ui/button";
import { Flow } from "@/utils/storage";

interface APIConnectButtonProps {
  flow: Flow;
  onClick: () => void;
}

export function APIConnectButton({ flow, onClick }: APIConnectButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="ml-2"
    >
      API Connect
    </Button>
  );
}
