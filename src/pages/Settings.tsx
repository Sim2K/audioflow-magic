import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { transcriptStorageSettings, StorageLocation } from "@/modules/settings/transcriptStorageSettings";
import { CloudIcon, HardDriveIcon } from "lucide-react";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [storageLocation, setStorageLocation] = useState<StorageLocation>('cloud');
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    setStorageLocation(transcriptStorageSettings.getStorageLocation());
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("openai_api_key", apiKey);
    toast({
      title: "Settings saved",
      description: "Your API key has been saved successfully.",
    });
  };

  const clearData = () => {
    localStorage.clear();
    setApiKey("");
    toast({
      title: "Data cleared",
      description: "All locally stored data has been cleared.",
    });
  };

  const toggleStorageLocation = () => {
    const newLocation: StorageLocation = storageLocation === 'cloud' ? 'local' : 'cloud';
    transcriptStorageSettings.setStorageLocation(newLocation);
    setStorageLocation(newLocation);
    toast({
      title: "Storage Location Updated",
      description: `Transcripts will now be saved ${newLocation === 'cloud' ? 'to the cloud' : 'locally'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api-keys">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="transcript-save">Transcript Save</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api-keys" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  OpenAI API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                />
              </div>
              <Button onClick={saveApiKey}>Save Settings</Button>
              <div className="pt-4 border-t">
                <Button variant="destructive" onClick={clearData}>
                  Clear All Data
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="transcript-save" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Transcript Storage Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose where to save your transcripts:
                  </p>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      {storageLocation === 'cloud' ? (
                        <CloudIcon className="w-4 h-4" />
                      ) : (
                        <HardDriveIcon className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {storageLocation === 'cloud' ? 'Save to Cloud' : 'Local Save Only'}
                      </span>
                    </div>
                    <Switch
                      checked={storageLocation === 'cloud'}
                      onCheckedChange={toggleStorageLocation}
                    />
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>Cloud Storage:</strong> Your transcripts will be available on all your devices when you log in.
                      Perfect for accessing your history anywhere!
                    </p>
                    <p>
                      <strong>Local Storage:</strong> Transcripts are saved only on this device.
                      They won't be available when you use other devices or browsers.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;