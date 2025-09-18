import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

const AnnouncementForm = ({ onSave, announcement, dialogOpen, setDialogOpen }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (dialogOpen) {
      if (announcement) {
        setTitle(announcement.title);
        setContent(announcement.content);
        setCategory(announcement.category || 'General');
        setIsPublished(announcement.is_published);
      } else {
        setTitle('');
        setContent('');
        setCategory('General');
        setIsPublished(false);
      }
    }
  }, [announcement, dialogOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const data = {
      user_id: user.id,
      title,
      content,
      category,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    };

    try {
      let response;
      if (announcement?.announcement_id) {
        response = await supabase.from('announcements').update(data).eq('announcement_id', announcement.announcement_id).select().single();
      } else {
        response = await supabase.from('announcements').insert(data).select().single();
      }

      if (response.error) throw response.error;
      toast({ title: "Success", description: `Announcement ${announcement ? 'updated' : 'created'}.` });
      onSave(response.data);
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[525px] bg-dialog-themed text-dialog-themed-foreground border-border">
        <DialogHeader>
          <DialogTitle>{announcement ? 'Edit' : 'Create'} Announcement</DialogTitle>
          <DialogDescription>Share important updates with your team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">Title</label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="ui-input mt-1" />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-muted-foreground">Content</label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={5} className="ui-textarea mt-1" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-muted-foreground">Category</label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="ui-input mt-1" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="isPublished" className="text-sm font-medium text-muted-foreground">Publish Immediately</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="ui-button-outline">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="ui-button-primary">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {announcement ? 'Save Changes' : 'Create Announcement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        announcement_id,
        title,
        content,
        category,
        is_published,
        published_at,
        created_at,
        user_id,
        author:profiles!inner!user_id(full_name, avatar_url) 
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching announcements:", error);
      toast({ title: "Error fetching announcements", description: error.message, variant: "destructive" });
      setAnnouncements([]);
    } else {
      setAnnouncements(data || []);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSave = () => {
    fetchAnnouncements(); 
  };
  
  const handleDelete = async (announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('announcement_id', announcementId);
      if (error) throw error;
      toast({ title: "Success", description: "Announcement deleted." });
      fetchAnnouncements();
    } catch (error) {
      toast({ title: "Error deleting announcement", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2 text-muted-foreground">Loading announcements...</span></div>;


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Latest Announcements</h2>
        <Button onClick={() => { setSelectedAnnouncement(null); setFormOpen(true); }} className="ui-button-primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <AnnouncementForm announcement={selectedAnnouncement} onSave={handleSave} dialogOpen={formOpen} setDialogOpen={setFormOpen} />
      
      {announcements.length === 0 ? (
        <Card className="bg-card-themed">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No announcements yet. Be the first to create one!</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
          <div className="space-y-4">
            {announcements.map((item) => (
              <Card key={item.announcement_id} className="bg-card-themed">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Category: {item.category || 'General'} | Published: {item.published_at ? format(new Date(item.published_at), 'PPp') : 'Draft'}
                      </CardDescription>
                    </div>
                    {item.user_id === user?.id && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedAnnouncement(item); setFormOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => handleDelete(item.announcement_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{item.content}</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Posted {formatDistanceToNowStrict(new Date(item.created_at), { addSuffix: true })}
                  {item.author?.full_name && ` by ${item.author.full_name}`}
                  {!item.author && item.user_id && ` by User ID: ${item.user_id.substring(0,8)}...`}
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AnnouncementsList;