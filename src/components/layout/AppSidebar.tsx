import { NavLink } from "react-router-dom";
import { Mic, GitBranch, Settings, FileText, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function AppSidebar() {
  const { setOpenMobile, isMobile, openMobile } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const menuItems = [
    { to: "/", icon: Mic, label: "Record", bgColor: "bg-purple-600" },
    { to: "/flows", icon: GitBranch, label: "Flows", bgColor: "bg-purple-500" },
    { to: "/transcripts", icon: FileText, label: "Transcripts" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const showLabels = !isCollapsed || (isMobile && openMobile);

  return (
    <Sidebar className={cn(
      "bg-background border-r transition-all duration-300",
      !isMobile && isCollapsed ? "w-[70px]" : "w-[240px]",
      isMobile && "fixed inset-y-0 left-0 z-50"
    )}>
      <div className="flex flex-col h-full">
        {!isMobile && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              {isCollapsed ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() => setIsCollapsed(false)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Mic className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-lg font-semibold">
                      AI Audio Flow
                    </h1>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 w-9 h-9"
                    onClick={() => setIsCollapsed(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="flex-1 px-2">
          <nav className="space-y-2">
            {menuItems.map(({ to, icon: Icon, label, bgColor }) => (
              <NavLink key={to} to={to} onClick={handleNavClick}>
                {({ isActive }) => (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-12 px-3",
                      "hover:bg-accent hover:text-accent-foreground",
                      "transition-all duration-200",
                      isActive && "bg-accent/50 text-accent-foreground font-medium",
                      !showLabels ? "justify-center" : "justify-start",
                      "rounded-xl"
                    )}
                  >
                    <div className={cn(
                      "flex items-center",
                      showLabels ? "gap-3" : "justify-center"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isActive ? bgColor || "bg-accent" : "bg-accent/30"
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      {showLabels && <span>{label}</span>}
                    </div>
                  </Button>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t">
          <div className={cn(
            "flex items-center",
            !showLabels ? "justify-center" : "gap-3 px-2"
          )}>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
            {showLabels && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Account</p>
                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}