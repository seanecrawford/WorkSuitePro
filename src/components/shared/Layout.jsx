import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import Chatbot from '@/components/shared/Chatbot';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const Layout = () => {
  const SIDEBAR_WIDTH_CLASS = 'w-60'; 
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const noChatbotPages = ['/landing', '/signup'];
  const showChatbot = !noChatbotPages.includes(location.pathname);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* pt-16 for header height */}
        
        <div className={cn(SIDEBAR_WIDTH_CLASS, "flex-shrink-0 hidden md:block bg-sidebar-themed border-r border-[var(--theme-border-primary)] shadow-lg")}>
          <Sidebar />
        </div>

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 md:hidden" 
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}
        <div 
          className={cn(
            "fixed top-16 bottom-0 left-0 z-40 md:hidden transform transition-transform ease-in-out duration-300",
            SIDEBAR_WIDTH_CLASS,
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "bg-sidebar-themed border-r border-[var(--theme-border-primary)] shadow-xl"
          )}
        >
          <Sidebar />
        </div>
        
        <main className="flex-1 flex flex-col overflow-hidden"> 
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-5 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      {showChatbot && <Chatbot />}
      <Toaster />
    </div>
  );
};

export default Layout;