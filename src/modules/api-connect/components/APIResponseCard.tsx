import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APIForwardResult } from "../types/api-result";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";

interface APIResponseCardProps {
  result: APIForwardResult | null;
}

export function APIResponseCard({ result }: APIResponseCardProps) {
  if (!result || (!result.url && !result.response && !result.error)) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>API Forward Response</CardTitle>
            <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
              {result.status === 'success' ? 'Success' : 'Error'}
              {result.statusCode && ` (${result.statusCode})`}
            </Badge>
          </div>
          {result.response && (
            <CopyButton 
              text={JSON.stringify(result.response, null, 2)} 
              label="Copy API response" 
            />
          )}
        </div>
        <CardDescription>
          {result.method} request to {result.url}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {result.error ? (
            <div className="text-red-500">{result.error}</div>
          ) : (
            <pre className="whitespace-pre-wrap overflow-auto max-h-[200px]">
              {JSON.stringify(result.response, null, 2)}
            </pre>
          )}
          <div className="text-xs text-muted-foreground mt-2">
            Timestamp: {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
