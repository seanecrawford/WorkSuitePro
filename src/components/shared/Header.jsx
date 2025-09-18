import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFullscreen } from '@/hooks/useFullscreen';
import { Settings, User, LayoutGrid, Bell, Maximize, Minimize, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { isFullscreen: isAppFullscreen, toggleFullscreen: toggleAppFullscreen } = useFullscreen();
  
  const logoIconUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/a9365322-bbe3-48f5-a0c3-474b7bc95d50/5dec98958824cda67e815b2d5131d721.png"; 

  const headerButtonBaseClass = "text-header-themed-foreground hover:bg-[hsl(var(--theme-text-primary))]/10";

  return (
    <motion.header 
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 70, damping: 20, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-header-themed shadow-none"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`${headerButtonBaseClass} mr-2 md:hidden`}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/dashboard" className="flex items-center group">
            <div className="bg-logo-card-themed p-1.5 rounded-md shadow-sm">
              <img src={logoIconUrl} alt="Work Suite Pro Icon" className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <span className={`hidden sm:inline-block text-lg font-semibold tracking-tight text-on-logo-card-themed group-hover:opacity-90 transition-opacity ml-2`}>Work Suite Pro</span>
          </Link>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleAppFullscreen} className={headerButtonBaseClass}>
            {isAppFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" className={`${headerButtonBaseClass} relative`}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-offset-1 ring-offset-[var(--theme-bg-header)] ring-red-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <div className="h-9 w-9 rounded-full bg-[hsl(var(--theme-text-primary)_/_0.2)] flex items-center justify-center border-2 border-[hsl(var(--theme-text-primary)_/_0.3)] hover:border-[hsl(var(--theme-text-primary)_/_0.7)] transition-all">
                    <User className="h-5 w-5 text-header-themed-foreground" />
                  </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground shadow-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal py-2 px-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    Guest User
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Explore the application
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem asChild className="hover:bg-accent focus:bg-accent cursor-pointer">
                <Link to="/dashboard" className="flex items-center py-2 px-3">
                  <LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-accent focus:bg-accent cursor-pointer">
                <Link to="/settings" className="flex items-center py-2 px-3">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-accent focus:bg-accent cursor-pointer">
                 <Link to="/profile" className="flex items-center py-2 px-3">
                  <User className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;