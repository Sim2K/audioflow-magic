import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Header() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  
  return isMobile ? (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-sm border-b z-50 flex items-center justify-between px-4">
      <div className="flex items-center">
        <SidebarTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 w-9 h-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>
        <h1 className="text-lg font-semibold ml-3">AI Audio Flow</h1>
      </div>
      {openMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 w-9 h-9"
          onClick={() => setOpenMobile(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </header>
  ) : null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar();
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 relative">
        <Header />
        <main className={cn("p-6", isMobile && "mt-14")}>
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
}