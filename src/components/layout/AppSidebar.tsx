import { NavLink } from "react-router-dom";
import { Mic, GitBranch, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex flex-col gap-2">
        <NavLink to="/">
          {({ isActive }) => (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Mic className="mr-2" />
              Record
            </Button>
          )}
        </NavLink>
        <NavLink to="/flows">
          {({ isActive }) => (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <GitBranch className="mr-2" />
              Flows
            </Button>
          )}
        </NavLink>
        <NavLink to="/transcripts">
          {({ isActive }) => (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <FileText className="mr-2" />
              Transcripts
            </Button>
          )}
        </NavLink>
        <NavLink to="/settings">
          {({ isActive }) => (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Settings className="mr-2" />
              Settings
            </Button>
          )}
        </NavLink>
      </div>
    </Sidebar>
  );
}