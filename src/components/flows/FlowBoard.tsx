import { Flow } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Pencil, Sparkles, Link2 } from "lucide-react";
import { FlowList } from "./FlowList";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAPIConnection } from "@/modules/api-connect/utils/storage";

interface FlowBoardProps {
  flows: Flow[];
  onFlowSelect: (flow: Flow | null) => void;
  onNewFlow: () => void;
  onEdit: (flow: Flow) => void;
  onDelete: (id: string) => void;
  onAPIConnect: (flow: Flow) => void;
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
  selectedFlow,
  isMobileView,
}: FlowBoardProps) {
  // Get API connection details if a flow is selected
  const apiConnection = selectedFlow ? getAPIConnection(selectedFlow.id) : null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-30 bg-background">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">Flows</h1>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
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
          {/* List Section - Fixed */}
          <div className={cn(
            isMobileView && selectedFlow ? "hidden" : "block",
            "md:block w-[400px]"
          )}>
            <div className="fixed w-[400px] top-[4rem] bottom-0 bg-background">
              <FlowList
                flows={flows}
                onFlowSelect={onFlowSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                selectedFlow={selectedFlow}
              />
            </div>
          </div>
          
          {/* Details Section - Scrollable */}
          <div className={cn(
            "flex-1 min-h-0 overflow-y-auto",
            isMobileView && !selectedFlow ? "hidden" : "flex-1"
          )}>
            <div className="w-full px-6">
              {selectedFlow ? (
                <>
                  {isMobileView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFlowSelect(null)}
                      className="flex items-center -ml-2 text-muted-foreground mb-4"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Flows
                    </Button>
                  )}

                  {/* Flow Title - Separate row for mobile */}
                  <div className={cn(
                    "flex flex-col gap-4",
                    !isMobileView && "flex-row items-center justify-between"
                  )}>
                    <h2 className="text-xl font-semibold">{selectedFlow.name}</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAPIConnect(selectedFlow)}
                        className="flex items-center gap-2"
                      >
                        <Link2 className="h-4 w-4" />
                        API Connect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(selectedFlow)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Flow
                      </Button>
                    </div>
                  </div>

                  {/* Flow Details */}
                  <div className="space-y-3 mt-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Endpoint</h3>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedFlow.endpoint}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Instructions</h3>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedFlow.instructions || "No instructions provided"}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Prompt Template</h3>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedFlow.prompt}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Format Template</h3>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedFlow.format}
                      </div>
                    </div>

                    {/* API Connection Details */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">API Connection</h3>
                      {apiConnection ? (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Method:</span>
                              <span>{apiConnection.method}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">URL:</span>
                              <span className="break-all">{apiConnection.url}</span>
                            </div>
                            <div className="font-medium mt-2 mb-1">Headers:</div>
                            {apiConnection.headers.map((header, index) => (
                              <div key={index} className="ml-2 flex justify-between">
                                <span>{header.key}:</span>
                                <span className="break-all">{header.value}</span>
                              </div>
                            ))}
                            {apiConnection.authType !== 'None' && (
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-medium">Auth Type:</span>
                                <span>{apiConnection.authType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          No API connection configured
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Flow Selected</h2>
                  <p className="text-sm text-muted-foreground">
                    Select a flow from the list to view its details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
