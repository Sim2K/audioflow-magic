import { NavLink } from "react-router-dom";
import { Mic, GitBranch, Settings, FileText, User, Menu, Home, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
  const { setOpenMobile, isMobile, openMobile } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut, session } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { to: "/", icon: Home, label: "Home", bgColor: "bg-purple-700" },
    { to: "/features", icon: Sparkles, label: "Features", bgColor: "bg-purple-600" },
    { to: "/record", icon: Mic, label: "Record", bgColor: "bg-purple-500" },
    { to: "/flows", icon: GitBranch, label: "Flows", bgColor: "bg-purple-400" },
    { to: "/transcripts", icon: FileText, label: "Transcripts", bgColor: "bg-purple-300" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const showLabels = !isCollapsed || (isMobile && openMobile);

  return (
    <Sidebar className={cn(
      "bg-background border-r flex flex-col fixed inset-y-0",
      !isMobile && isCollapsed ? "w-[70px]" : "w-[240px]",
      isMobile && "z-50"
    )}>
      {/* Header - Sticky */}
      {!isMobile && (
        <div className="flex-shrink-0 p-4 border-b bg-background">
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
      
      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-3">
          {menuItems.map(({ to, icon: Icon, label, bgColor }) => (
            <NavLink key={to} to={to} onClick={handleNavClick}>
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-12 px-3 mb-3",
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
                      isActive ? bgColor || "bg-accent" : "bg-accent/30",
                      "transition-colors duration-200"
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

      {/* Footer - Sticky */}
      <div className="flex-shrink-0 border-t bg-background">
        <div className="p-4 space-y-3">
          <a 
            href="https://gpts4u.com/aiaudioflows" 
            target="_blank" 
            className="block"
            onClick={handleNavClick}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full h-12 px-3",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-all duration-200",
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
                  "bg-purple-200"
                )}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                {showLabels && <span>Flow Help</span>}
              </div>
            </Button>
          </a>

          <Button
            variant="ghost"
            className={cn(
              "w-full h-12 px-3",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-all duration-200",
              !showLabels ? "justify-center" : "justify-start",
              "rounded-xl"
            )}
            onClick={() => navigate('/settings')}
          >
            <div className={cn(
              "flex items-center",
              showLabels ? "gap-3" : "justify-center"
            )}>
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
              {showLabels && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">User Account</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email?.slice(0, 25) || 'user@example.com'}</p>
                </div>
              )}
            </div>
          </Button>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            className={cn(
              "w-full h-12 px-3",
              "hover:bg-destructive/10 hover:text-destructive",
              "transition-all duration-200",
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
                "bg-destructive/20"
              )}>
                <LogOut className="h-4 w-4 text-destructive" />
              </div>
              {showLabels && <span className="text-destructive">Sign Out</span>}
            </div>
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}