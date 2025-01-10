import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APIConnection, HTTPMethod, AuthType } from "../types/api-connect";
import { Flow } from "@/utils/storage";
import { saveAPIConnection, getAPIConnection } from "../utils/storage";
import { useToast } from "@/hooks/use-toast";
import { parseHeadersText } from "../utils/header-parser";

interface APIConnectFormProps {
  flow: Flow;
  isOpen: boolean;
  onClose: () => void;
}

export function APIConnectForm({ flow, isOpen, onClose }: APIConnectFormProps) {
  const [method, setMethod] = useState<HTTPMethod>("GET");
  const [url, setUrl] = useState("");
  const [authType, setAuthType] = useState<AuthType>("None");
  const [authToken, setAuthToken] = useState("");
  const [headersText, setHeadersText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load existing API connection when form opens
  useEffect(() => {
    if (isOpen) {
      const existingConnection = getAPIConnection(flow.id);
      if (existingConnection) {
        setMethod(existingConnection.method);
        setUrl(existingConnection.url);
        setAuthType(existingConnection.authType);
        setAuthToken(existingConnection.authToken || "");
        
        // Format headers back to text
        const headersFormatted = existingConnection.headers
          .map(header => `${header.key}: ${header.value}`)
          .join('\n');
        setHeadersText(headersFormatted);
      } else {
        // Reset form for new connections
        setMethod("GET");
        setUrl("");
        setAuthType("None");
        setAuthToken("");
        setHeadersText("");
      }
      setError(null);
    }
  }, [flow.id, isOpen]);

  const handleSubmit = () => {
    try {
      setError(null);

      // Validate URL
      if (!url.trim()) {
        throw new Error("URL is required");
      }

      // Validate auth token if needed
      if ((authType === "Bearer" || authType === "Basic") && !authToken.trim()) {
        throw new Error(`${authType} token is required`);
      }

      // Parse headers
      const headers = headersText.trim() ? parseHeadersText(headersText) : [];

      // Create connection object
      const connection: APIConnection = {
        flowId: flow.id,
        method,
        url: url.trim(),
        headers,
        authType,
        ...(authType !== "None" && { authToken: authToken.trim() })
      };

      saveAPIConnection(connection);
      
      toast({
        title: "Success",
        description: "API connection saved successfully",
      });
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect API to Flow</DialogTitle>
          <DialogDescription>
            Configure the API connection details for this flow.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="method">Method</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as HTTPMethod)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="authType">Authentication Type</Label>
            <Select value={authType} onValueChange={(value) => setAuthType(value as AuthType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select auth type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Bearer">Bearer Token</SelectItem>
                <SelectItem value="Basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {authType !== "None" && (
            <div className="grid gap-2">
              <Label htmlFor="authToken">{authType} Token</Label>
              <Input
                id="authToken"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder={`Enter ${authType.toLowerCase()} token`}
                type="password"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="headers">Headers/Parameters</Label>
            <Textarea
              id="headers"
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder={`Enter headers/parameters (one per line)\nExamples:\nContent-Type: application/json\n-H "apikey: YOUR_KEY"\n-P "Authorization: Bearer TOKEN"`}
              className="h-[120px] font-mono text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
