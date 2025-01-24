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
import { useAuth } from "@/hooks/useAuth";

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
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function loadExistingConnection() {
      if (!user) return;
      
      try {
        const connection = await getAPIConnection(flow.id, user.id);
        if (connection) {
          setMethod(connection.method);
          setUrl(connection.url);
          setAuthType(connection.authType);
          setAuthToken(connection.authToken || "");
          
          // Format headers from APIHeader array
          if (connection.headers && Array.isArray(connection.headers)) {
            const headersText = connection.headers
              .map(header => `${header.key}: ${header.value}`)
              .join('\n');
            setHeadersText(headersText);
          } else {
            setHeadersText('');
          }
        }
      } catch (error) {
        console.error('Error loading API connection:', error);
        toast({
          title: "Error",
          description: "Failed to load API connection",
          variant: "destructive",
        });
      }
    }
    if (isOpen) {
      loadExistingConnection();
    }
  }, [flow.id, isOpen, user]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to save API connections",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = parseHeadersText(headersText);
      await saveAPIConnection({
        flowId: flow.id,
        method,
        url,
        authType,
        authToken: authToken || undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined
      }, user.id);

      toast({
        title: "Success",
        description: "API connection saved successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error saving API connection:', error);
      toast({
        title: "Error",
        description: "Failed to save API connection",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configure API Connection</DialogTitle>
          <DialogDescription>
            Set up an API connection for flow: {flow.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select value={method} onValueChange={(value: HTTPMethod) => setMethod(value)}>
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
            <Label htmlFor="auth-type">Authentication</Label>
            <Select value={authType} onValueChange={(value: AuthType) => setAuthType(value)}>
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
              <Label htmlFor="auth-token">
                {authType === "Bearer" ? "Bearer Token" : "Basic Auth Token"}
              </Label>
              <Input
                id="auth-token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                type="password"
                placeholder={authType === "Bearer" ? "Enter bearer token" : "Enter basic auth token"}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="headers">Headers (one per line, format: Key: Value)</Label>
            <Textarea
              id="headers"
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder="Content-Type: application/json"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Connection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
