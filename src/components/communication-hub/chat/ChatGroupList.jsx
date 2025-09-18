import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PlusCircle, Loader2, Lock } from 'lucide-react';

const ChatGroupList = ({ onSelectGroup, activeGroupId }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isNewGroupPrivate, setIsNewGroupPrivate] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    
    let query = supabase.from('chat_groups').select('*');

    if (user && user.id) {
      const { data: memberGroupIds, error: memberError } = await supabase
        .from('chat_group_members')
        .select('group_id')
        .eq('userid', user.id);

      if (memberError) {
        toast({ title: "Error fetching group memberships", description: memberError.message, variant: "destructive" });
      } else {
        const groupIdsUserIsMemberOf = memberGroupIds.map(mg => mg.group_id);
        if (groupIdsUserIsMemberOf.length > 0) {
          query = query.or(`is_private.eq.false,group_id.in.(${groupIdsUserIsMemberOf.join(',')})`);
        } else {
          query = query.or(`is_private.eq.false`);
        }
      }
    } else {
      query = query.eq('is_private', false);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      toast({ title: "Error fetching groups", description: error.message, variant: "destructive" });
      setGroups([]);
    } else {
      setGroups(data || []);
    }
    setIsLoading(false);
  }, [toast, user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Authentication Required", description: "You must be logged in to create a group.", variant: "destructive" });
        return;
    }
    if (!newGroupName.trim()) {
        toast({ title: "Group Name Required", description: "Please enter a name for the group.", variant: "destructive" });
        return;
    }
    setIsCreatingGroup(true);
    
    const { data: newGroupData, error } = await supabase
      .from('chat_groups')
      .insert({ 
        name: newGroupName, 
        description: newGroupDescription, 
        is_private: isNewGroupPrivate, 
        created_by_userid: user.id 
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error creating group", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Group "${newGroupData.name}" created.` });
      const { error: memberError } = await supabase.from('chat_group_members').insert({ group_id: newGroupData.group_id, userid: user.id, role: 'admin' });
      if (memberError) console.error("Error adding creator as member:", memberError.message);
      
      setNewGroupName('');
      setNewGroupDescription('');
      setIsNewGroupPrivate(false);
      setShowCreateGroupDialog(false);
      fetchGroups(); 
      onSelectGroup(newGroupData); 
    }
    setIsCreatingGroup(false);
  };

  if (isLoading) return <div className="p-3 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>;

  return (
    <div className="flex flex-col h-full bg-card-alt-themed border-r border-border">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <h3 className="text-md font-semibold text-foreground">Chat Groups</h3>
        {user && (
          <Button variant="ghost" size="icon" onClick={() => setShowCreateGroupDialog(true)} className="text-primary hover:text-primary/80">
            <PlusCircle className="h-5 w-5" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        {groups.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No groups found. {user ? "Create one!" : "Log in to see or create groups."}</p>
        ) : (
          groups.map(group => (
            <button
              key={group.group_id}
              onClick={() => onSelectGroup(group)}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-primary/10 transition-colors flex items-center justify-between ${activeGroupId === group.group_id ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground'}`}
            >
              <span>{group.name}</span>
              {group.is_private && <Lock className="h-3 w-3 text-muted-foreground ml-1" />}
            </button>
          ))
        )}
      </ScrollArea>
      <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
        <DialogContent className="bg-dialog-themed">
          <DialogHeader>
            <DialogTitle>Create New Chat Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4 py-2">
            <Input placeholder="Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required className="ui-input"/>
            <Textarea placeholder="Description (optional)" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} className="ui-textarea"/>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isNewGroupPrivate" checked={isNewGroupPrivate} onChange={e => setIsNewGroupPrivate(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="isNewGroupPrivate" className="text-sm font-medium text-muted-foreground">Private Group</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateGroupDialog(false)} className="ui-button-outline">Cancel</Button>
              <Button type="submit" className="ui-button-primary" disabled={isCreatingGroup}>
                {isCreatingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Group
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatGroupList;