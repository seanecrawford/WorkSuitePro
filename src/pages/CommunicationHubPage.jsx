import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamChatTab from '@/components/communication-hub/TeamChatTab';
import AnnouncementsTab from '@/components/communication-hub/AnnouncementsTab';
import ForumsTab from '@/components/communication-hub/ForumsTab';
import KnowledgeBaseTab from '@/components/communication-hub/KnowledgeBaseTab';
import AiToolsTab from '@/components/communication-hub/AiToolsTab';
import { MessageSquare, Rss, MessageCircle, BrainCircuit, BookOpen, Bot } from 'lucide-react';

const CommunicationHubPage = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const tabComponents = {
    chat: TeamChatTab,
    announcements: AnnouncementsTab,
    forums: ForumsTab,
    knowledge: KnowledgeBaseTab,
    aiTools: AiToolsTab,
  };

  const tabInfo = [
    { value: "chat", label: "Team Chat", icon: MessageSquare },
    { value: "announcements", label: "Announcements", icon: Rss },
    { value: "forums", label: "Discussion Forums", icon: MessageCircle },
    { value: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { value: "aiTools", label: "AI Assistant Tools", icon: Bot },
  ];

  const CurrentTabComponent = tabComponents[activeTab];

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate"
      className="flex flex-col h-full p-0 md:p-0 bg-background text-foreground"
    >
      <header className="flex-shrink-0 p-4 md:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-[var(--theme-accent-communication)]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Communication Hub</h1>
            <p className="text-sm text-muted-foreground">Connect, collaborate, and share knowledge seamlessly.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 md:px-6 pt-4">
            <TabsList className="tabs-communication grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {tabInfo.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <tab.icon className="mr-2 h-4 w-4"/>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            {tabInfo.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="h-full mt-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                {activeTab === tab.value && <CurrentTabComponent />}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default CommunicationHubPage;