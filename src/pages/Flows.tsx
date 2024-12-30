import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Flows = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automation Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create and manage your automation flows here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Flows;