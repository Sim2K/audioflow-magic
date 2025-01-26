import { Flow } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Pencil, Sparkles, Link2, MessageSquare } from "lucide-react";
import { FlowList } from "./FlowList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAPIConnection } from "@/modules/api-connect/utils/storage";
import { useEffect, useState } from "react";
import { APIConnection, APIHeader } from "@/modules/api-connect/types/api-connect";
import { useAuth } from "@/hooks/useAuth";
import { FlowChatButton } from "@/modules/flowchat";

interface FlowBoardProps {
  flows: Flow[];
  onFlowSelect: (flow: Flow | null) => void;
  onNewFlow: () => void;
  onEdit: (flow: Flow) => void;
  onDelete: (id: string) => void;
  onAPIConnect: (flow: Flow) => void;
  onFlowChat: (flow: Flow) => void;
  selectedFlow: Flow | null;
  isMobileView: boolean;
}

export function FlowBoard({
  flows,
  onFlowSelect,
  onNewFlow,
  onEdit,
  onDelete,
  onAPIConnect,
  onFlowChat,
  selectedFlow,
  isMobileView,
}: FlowBoardProps) {
  const [apiConnection, setApiConnection] = useState<APIConnection | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAPIConnection() {
      if (selectedFlow && user) {
        const connection = await getAPIConnection(selectedFlow.id, user.id);
        setApiConnection(connection);
      } else {
        setApiConnection(null);
      }
    }
    fetchAPIConnection();
  }, [selectedFlow, user]);

  return (
    <div className="h-full flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">Flows</h1>
          </div>
          <div className="flex w-full sm:w-auto gap-2 mt-2 sm:mt-0">
            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none justify-center">
              <a href="https://gpts4u.com/aiaudioflows" target="_blank" rel="noopener noreferrer">
                <Sparkles className="h-4 w-4 mr-2" />
                Flow Help
              </a>
            </Button>
            <Button onClick={onNewFlow} size="sm" className="flex-1 sm:flex-none justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Add new flow
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* List Section */}
          <div className={cn(
            "w-full md:w-[400px] border-r",
            isMobileView && selectedFlow ? "hidden" : "block"
          )}>
            <div className="h-full overflow-y-auto">
              <FlowList
                flows={flows}
                onFlowSelect={onFlowSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                selectedFlow={selectedFlow}
              />
            </div>
          </div>
          
          {/* Details Section */}
          <div className={cn(
            "w-full md:flex-1 min-h-0 overflow-y-auto",
            isMobileView && !selectedFlow ? "hidden" : "block"
          )}>
            <div className="p-6">
              {selectedFlow ? (
                <>
                  {isMobileView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFlowSelect(null)}
                      className="mb-4 -ml-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Flows
                    </Button>
                  )}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2 sm:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onFlowChat(selectedFlow)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Flow Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAPIConnect(selectedFlow)}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            API Connect
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(selectedFlow)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Flow
                          </Button>
                        </div>
                        <div>
                          <CardTitle>{selectedFlow.name}</CardTitle>
                          <CardDescription>{selectedFlow.instructions || "No description"}</CardDescription>
                        </div>
                        <div className="hidden sm:flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onFlowChat(selectedFlow)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Flow Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAPIConnect(selectedFlow)}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            API Connect
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(selectedFlow)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Flow
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-1">Name</h3>
                          <p className="text-muted-foreground">
                            {selectedFlow.name}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium mb-1">Instructions</h3>
                          <div className="bg-muted rounded-lg p-3">
                            {selectedFlow.instructions || "Just talk!"}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-1">Prompt Template</h3>
                          <div className="bg-muted rounded-lg p-3">
                            {selectedFlow.prompt}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-1">Format Template</h3>
                          <div className="bg-muted rounded-lg p-3">
                            {selectedFlow.format}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-1">API Connection</h3>
                          <div className="bg-muted rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Method:</span>
                              <span className="text-right">{apiConnection?.method || 'POST'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>URL:</span>
                              <span className="text-right break-all">{apiConnection?.url || 'https://zzazz.free.beeceptor.com/todo'}</span>
                            </div>
                            <div>
                              <div className="mb-1">Headers:</div>
                              <div className="space-y-1">
                                {apiConnection?.headers ? (
                                  apiConnection.headers.map((header, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                      <span>{header.key}:</span>
                                      <span className="text-right">{header.value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <span>some-header:</span>
                                      <span className="text-right">value</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>some-header2:</span>
                                      <span className="text-right">value2</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <p>No Flow Selected</p>
                  <p className="text-sm">Select a flow from the list to view its details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
