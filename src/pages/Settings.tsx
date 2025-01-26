import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { transcriptStorageSettings, StorageLocation } from "@/modules/settings/transcriptStorageSettings";
import { CloudIcon, HardDriveIcon, UserIcon, KeyIcon, WrenchIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [storageLocation, setStorageLocation] = useState<StorageLocation>('cloud');
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const { session, updateProfile } = useAuth();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    setStorageLocation(transcriptStorageSettings.getStorageLocation());
    if (session?.user?.email) {
      setNewEmail(session.user.email);
    }
  }, [session]);

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

  const handleUpdateEmail = async () => {
    try {
      await updateProfile({ user_email: newEmail });
      toast({
        title: "Email Updated",
        description: "Your email has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <KeyIcon className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center gap-2">
            <WrenchIcon className="h-4 w-4" />
            App Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your new email"
                />
              </div>
              <Button onClick={handleUpdateEmail}>Update Email</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleUpdatePassword}>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">OpenAI API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key"
                  />
                  <Button onClick={saveApiKey}>Save API Key</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transcript Storage Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    id="storage-location"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={clearData}>
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;