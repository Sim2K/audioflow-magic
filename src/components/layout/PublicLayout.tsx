import { MenuDropdown } from '../navigation/MenuDropdown';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="mr-4">
            <a href="/" className="flex items-center space-x-2">
              <span className="font-bold">AIAudioFlow</span>
            </a>
          </div>
          <MenuDropdown />
        </div>
      </header>
      {children}
    </div>
  );
}
