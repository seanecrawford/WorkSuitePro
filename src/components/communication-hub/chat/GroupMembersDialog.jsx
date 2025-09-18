import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, UserX, UserCheck } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
};

const GroupMembersDialog = ({ isOpen, onOpenChange, group, userProfiles }) => {
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchGroupMembers = useCallback(async () => {
    if (!group?.group_id) return;
    setIsLoadingMembers(true);
    const { data, error } = await supabase
      .from('chat_group_members')
      .select(`
        userid,
        role,
        joined_at,
        profile:profiles(user_id, fullname, avatar_url)
      `)
      .eq('group_id', group.group_id);

    if (error) {
      toast({ title: "Error fetching group members", description: error.message, variant: "destructive" });
      setMembers([]);
    } else {
      setMembers(data || []);
    }
    setIsLoadingMembers(false);
  }, [group, toast]);

  useEffect(() => {
    if (isOpen && group?.group_id) {
      fetchGroupMembers();
    }
  }, [isOpen, group, fetchGroupMembers]);
  
  const isCurrentUserAdmin = members.find(m => m.userid === user?.id)?.role === 'admin';

  const handleRemoveMember = async (memberToRemoveId) => {
    if (!user) {
        toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    if (!isCurrentUserAdmin || memberToRemoveId === user?.id) {
      toast({ title: "Permission Denied", description: "Admins cannot remove themselves or action not permitted.", variant: "destructive" });
      return;
    }
    
    const { error } = await supabase
      .from('chat_group_members')
      .delete()
      .eq('group_id', group.group_id)
      .eq('userid', memberToRemoveId);

    if (error) {
      toast({ title: "Error removing member", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Member Removed", description: "The member has been removed from the group." });
      fetchGroupMembers(); 
    }
  };
  
  const handleChangeRole = async (memberToUpdateId, newRole) => {
    if (!user) {
        toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    if (!isCurrentUserAdmin || memberToUpdateId === user?.id) {
      toast({ title: "Permission Denied", description: "Admins cannot change their own role or action not permitted.", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from('chat_group_members')
      .update({ role: newRole })
      .eq('group_id', group.group_id)
      .eq('userid', memberToUpdateId);

    if (error) {
      toast({ title: "Error updating role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role Updated", description: "Member role has been updated." });
      fetchGroupMembers(); 
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dialog-themed sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Members of {group?.name}</DialogTitle>
          <DialogDescription>View and manage members of this group.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] my-4 pr-3">
          {isLoadingMembers && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
          {!isLoadingMembers && members.length === 0 && <p className="text-muted-foreground text-center py-4">No members found.</p>}
          {!isLoadingMembers && members.map(member => (
            <div key={member.userid} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.profile?.avatar_url || userProfiles[member.userid]?.avatar_url || undefined} alt={member.profile?.fullname || userProfiles[member.userid]?.full_name || 'User'} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">{getInitials(member.profile?.fullname || userProfiles[member.userid]?.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.profile?.fullname || userProfiles[member.userid]?.full_name || 'Loading...'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
              {isCurrentUserAdmin && member.userid !== user?.id && (
                <div className="flex items-center gap-1">
                   {member.role !== 'admin' && (
                    <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-400 h-7 w-7" onClick={() => handleChangeRole(member.userid, 'admin')}>
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  )}
                  {member.role === 'admin' && (
                     <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-400 h-7 w-7" onClick={() => handleChangeRole(member.userid, 'member')}>
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-7 w-7" onClick={() => handleRemoveMember(member.userid)}>
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="ui-button-primary">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersDialog;