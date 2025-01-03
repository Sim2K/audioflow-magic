import { NavLink } from "react-router-dom";
import { Mic, GitBranch, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <div className="px-4 py-6 border-b">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Audio Flow
          </h1>
        </div>
        
        <div className="flex flex-col gap-1 p-2">
          <NavLink to="/">
            {({ isActive }) => (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start transition-colors hover:bg-accent"
              >
                <Mic className="mr-2 h-4 w-4" />
                Record
              </Button>
            )}
          </NavLink>
          <NavLink to="/flows">
            {({ isActive }) => (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start transition-colors hover:bg-accent"
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Flows
              </Button>
            )}
          </NavLink>
          <NavLink to="/transcripts">
            {({ isActive }) => (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start transition-colors hover:bg-accent"
              >
                <FileText className="mr-2 h-4 w-4" />
                Transcripts
              </Button>
            )}
          </NavLink>
          <NavLink to="/settings">
            {({ isActive }) => (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start transition-colors hover:bg-accent"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            )}
          </NavLink>
        </div>
      </div>
    </Sidebar>
  );
}