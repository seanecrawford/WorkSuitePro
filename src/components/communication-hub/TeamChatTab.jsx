import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';

import ChatGroupList from './chat/ChatGroupList';
import ChatMessageArea from './chat/ChatMessageArea';
import ChatSummaryDialog from './chat/ChatSummaryDialog';

const TeamChatTab = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [currentSummaryGroupName, setCurrentSummaryGroupName] = useState('');


  const handleSummarizeChat = async (chatContent, groupName) => {
    if (!chatContent || chatContent.trim().length < 50) { 
      toast({ title: "Summarization", description: "Not enough content to summarize.", variant: "default" });
      return;
    }
    setIsSummarizing(true);
    setSummaryResult(null);
    setCurrentSummaryGroupName(groupName);
    setShowSummaryDialog(true); 

    try {
      const { data, error } = await supabase.functions.invoke('summarize-text', {
        body: { text_to_summarize: chatContent },
      });

      if (error) throw error;
      
      setSummaryResult({ summary: data.summary || "No summary returned." });

    } catch (error) {
      console.error("Error summarizing chat:", error);
      toast({ title: "Summarization Error", description: error.message || "Could not summarize chat.", variant: "destructive" });
      setSummaryResult({ summary: "Error: Could not generate summary." });
    } finally {
      setIsSummarizing(false);
    }
  };


  return (
    <>
      <div className="flex h-[calc(100vh-12rem)] border border-border rounded-lg overflow-hidden shadow-md">
        <div className="w-1/4 min-w-[200px] max-w-[300px]">
          <ChatGroupList onSelectGroup={setSelectedGroup} activeGroupId={selectedGroup?.group_id} />
        </div>
        <ChatMessageArea selectedGroup={selectedGroup} onSummarizeChat={handleSummarizeChat} />
      </div>
      <ChatSummaryDialog
        isOpen={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        summaryResult={summaryResult}
        groupName={currentSummaryGroupName}
        isSummarizing={isSummarizing}
      />
    </>
  );
};

export default TeamChatTab;