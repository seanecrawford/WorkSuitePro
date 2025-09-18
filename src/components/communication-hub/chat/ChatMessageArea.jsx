import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNowStrict } from 'date-fns';
import { Send, Paperclip, Settings2, MessageCircle, Loader2, Users } from 'lucide-react';
import GroupMembersDialog from './GroupMembersDialog';

const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
};

const ChatMessageArea = ({ selectedGroup, onSummarizeChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [usersDetails, setUsersDetails] = useState({});
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);

  const fetchUserDetails = useCallback(async (userIds) => {
    const uniqueUserIds = [...new Set(userIds)].filter(id => id && !usersDetails[id]);
    if (uniqueUserIds.length === 0) return;

    const newUsers = {};
    for (const userId of uniqueUserIds) {
        const { data, error } = await supabase.rpc('get_user_profile_details', { user_uuid: userId });
        if (error) {
            console.error(`Error fetching profile for ${userId}:`, error);
            newUsers[userId] = { full_name: 'Unknown User', avatar_url: null, email: 'N/A' };
        } else if (data && data.length > 0) {
            newUsers[userId] = data[0];
        } else {
             newUsers[userId] = { full_name: 'User Not Found', avatar_url: null, email: 'N/A' };
        }
    }
    setUsersDetails(prev => ({ ...prev, ...newUsers }));
  }, [usersDetails]);


  const fetchMessages = useCallback(async () => {
    if (!selectedGroup?.group_id) return;
    setIsLoadingMessages(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('group_id', selectedGroup.group_id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: "Error fetching messages", description: error.message, variant: "destructive" });
      setMessages([]);
    } else {
      setMessages(data || []);
      const senderIds = data ? data.map(m => m.sender_id).filter(id => id) : [];
      if (senderIds.length > 0) fetchUserDetails(senderIds);
    }
    setIsLoadingMessages(false);
  }, [selectedGroup, toast, fetchUserDetails]);

  useEffect(() => {
    fetchMessages();
    if (selectedGroup?.group_id) {
      const channel = supabase
        .channel(`chat_messages:${selectedGroup.group_id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `group_id=eq.${selectedGroup.group_id}` }, (payload) => {
          setMessages(currentMessages => [...currentMessages, payload.new]);
          if (payload.new.sender_id) fetchUserDetails([payload.new.sender_id]);
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [selectedGroup, fetchMessages, fetchUserDetails]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup?.group_id) return;
    if (!user) {
        toast({ title: "Authentication Required", description: "You must be logged in to send messages.", variant: "destructive" });
        return;
    }
    setIsSending(true);

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        group_id: selectedGroup.group_id,
        sender_id: user.id,
        content: newMessage,
        message_type: 'text',
      });

    if (error) {
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    } else {
      setNewMessage('');
    }
    setIsSending(false);
  };

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-card-themed">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Select a group to start chatting.</p>
        </div>
      </div>
    );
  }
  
  const handleSummarizeClick = () => {
    if (onSummarizeChat) {
      const chatContent = messages.map(msg => `${usersDetails[msg.sender_id]?.full_name || 'User'}: ${msg.content}`).join('\n');
      onSummarizeChat(chatContent, selectedGroup.name);
    }
  };


  return (
    <>
    <div className="flex-1 flex flex-col h-full bg-card-themed">
      <header className="p-3 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="text-md font-semibold text-foreground">{selectedGroup.name}</h3>
          <p className="text-xs text-muted-foreground">{selectedGroup.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleSummarizeClick} className="ui-button-outline text-xs px-2 py-1 h-auto">
            Summarize
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowMembersDialog(true)} className="ui-button-outline text-xs px-2 py-1 h-auto">
            <Users className="h-4 w-4 mr-1" /> Members
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-7 w-7"><Settings2 className="h-4 w-4" /></Button>
        </div>
      </header>
      <ScrollArea className="flex-1 p-3 space-y-3" ref={scrollAreaRef}>
        {isLoadingMessages && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
        {!isLoadingMessages && messages.length === 0 && <p className="text-muted-foreground text-center py-4">No messages yet in this group.</p>}
        {messages.map(msg => {
          const senderDetails = usersDetails[msg.sender_id] || { full_name: 'Loading...', avatar_url: null };
          const isCurrentUser = msg.sender_id === user?.id;
          return (
            <div key={msg.message_id} className={`flex items-start gap-2.5 ${isCurrentUser ? 'justify-end' : ''}`}>
              {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderDetails.avatar_url || undefined} alt={senderDetails.full_name || ''} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">{getInitials(senderDetails.full_name)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-3 py-2 rounded-xl ${isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-input-themed text-foreground rounded-bl-none'}`}>
                  {!isCurrentUser && <p className="text-xs font-semibold mb-0.5 text-primary">{senderDetails.full_name}</p>}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-2xs text-muted-foreground mt-1">
                  {formatDistanceToNowStrict(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
              {isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderDetails.avatar_url || undefined} alt={senderDetails.full_name || ''} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">{getInitials(senderDetails.full_name)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Paperclip className="h-5 w-5" /></Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 ui-input"
          autoComplete="off"
          disabled={isSending || !user}
        />
        <Button type="submit" size="icon" className="ui-button-primary" disabled={isSending || !user}>
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
    <GroupMembersDialog 
        isOpen={showMembersDialog} 
        onOpenChange={setShowMembersDialog} 
        group={selectedGroup}
        userProfiles={usersDetails}
      />
    </>
  );
};

export default ChatMessageArea;