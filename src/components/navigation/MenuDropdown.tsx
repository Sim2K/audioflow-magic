import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { Mic } from 'lucide-react';
import { GitBranch } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Settings } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { LogIn } from 'lucide-react';
import { UserPlus } from 'lucide-react';

export function MenuDropdown() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {/* Public Routes */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/features')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Features
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* App Routes */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/record')}
        >
          <Mic className="mr-2 h-4 w-4" />
          Record
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/flows')}
        >
          <GitBranch className="mr-2 h-4 w-4" />
          Flows
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/transcripts')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Transcripts
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Auth Actions */}
        {user ? (
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/auth/login')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/auth/register')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
