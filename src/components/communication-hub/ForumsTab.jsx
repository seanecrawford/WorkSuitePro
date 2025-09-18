import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { PlusCircle, MessageSquare, ThumbsUp, CornerDownRight, Eye, Lock, Unlock, Pin, PinOff, Loader2 } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : names[0][0].toUpperCase();
};

const ForumCategoryItem = ({ category, onSelectCategory, isActive }) => (
  <Button
    variant="ghost"
    className={`w-full justify-start px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-primary/10 text-foreground'}`}
    onClick={() => onSelectCategory(category)}
  >
    {category.name}
  </Button>
);

const ThreadItem = ({ thread, onSelectThread, userProfiles }) => (
  <Card 
    className="hover:shadow-md transition-shadow cursor-pointer bg-card-alt-themed hover:border-primary/50"
    onClick={() => onSelectThread(thread)}
  >
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-medium text-foreground">{thread.is_pinned && <Pin className="inline h-4 w-4 mr-1 text-amber-500"/>}{thread.title}</CardTitle>
      <CardDescription className="text-xs">
        By: {userProfiles[thread.user_id]?.fullname || '...'} | Replies: {thread.reply_count || 0} | Views: {thread.view_count || 0}
      </CardDescription>
    </CardHeader>
    <CardFooter className="text-xs text-muted-foreground pt-1 pb-2">
      Last reply: {formatDistanceToNowStrict(new Date(thread.last_reply_at || thread.created_at), { addSuffix: true })}
      {thread.is_locked && <Lock className="inline h-3 w-3 ml-2 text-red-500"/>}
    </CardFooter>
  </Card>
);

const PostItem = ({ post, userProfiles, onReply, onReact, currentUserId }) => {
  const author = userProfiles[post.user_id] || { fullname: 'Loading...', avatar_url: null };
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { toast } = useToast();

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    await onReply(post.thread_id, replyContent, post.post_id);
    setIsSubmittingReply(false);
    setReplyContent('');
    setShowReplyForm(false);
  };
  
  // Placeholder for actual like count, ideally fetched or aggregated
  const likeCount = post.reactions?.filter(r => r.reaction_type === 'like').length || 0;


  return (
    <Card className="mb-3 bg-card-themed shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <Avatar className="h-9 w-9">
          <AvatarImage src={author.avatar_url} alt={author.fullname} />
          <AvatarFallback>{getInitials(author.fullname)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{author.fullname}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNowStrict(new Date(post.created_at), { addSuffix: true })}
            {post.updated_at !== post.created_at && ` (edited ${formatDistanceToNowStrict(new Date(post.updated_at), { addSuffix: true })})`}
          </p>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-foreground whitespace-pre-wrap pb-2 ml-12">{post.content}</CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-1 pb-2 ml-12 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-1 h-auto hover:text-primary" onClick={() => onReact(post.post_id, 'like')}>
          <ThumbsUp className="h-4 w-4 mr-1" /> Like ({likeCount})
        </Button>
        <Button variant="ghost" size="sm" className="p-1 h-auto hover:text-primary" onClick={() => setShowReplyForm(!showReplyForm)}>
          <CornerDownRight className="h-4 w-4 mr-1" /> Reply
        </Button>
      </CardFooter>
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="ml-12 p-3 border-t border-border">
          <Textarea 
            value={replyContent} 
            onChange={(e) => setReplyContent(e.target.value)} 
            placeholder={`Replying to ${author.fullname}...`} 
            className="ui-textarea text-sm mb-2"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowReplyForm(false)} className="ui-button-outline">Cancel</Button>
            <Button type="submit" size="sm" className="ui-button-primary" disabled={isSubmittingReply}>
              {isSubmittingReply && <Loader2 className="h-4 w-4 animate-spin mr-1"/>} Submit Reply
            </Button>
          </div>
        </form>
      )}
      {post.replies && post.replies.length > 0 && (
        <div className="ml-16 mt-2 pl-4 border-l border-border">
          {post.replies.map(reply => (
            <PostItem key={reply.post_id} post={reply} userProfiles={userProfiles} onReply={onReply} onReact={onReact} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </Card>
  );
};


const ForumsTab = () => {
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [isLoading, setIsLoading] = useState({ categories: true, threads: false, posts: false });
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserProfiles = useCallback(async (userIds) => {
    const idsToFetch = userIds.filter(id => id && !userProfiles[id]);
    if (idsToFetch.length === 0) return;

    const { data, error } = await supabase.from('profiles').select('user_id, fullname, avatar_url').in('user_id', idsToFetch);
    if (error) {
      toast({ title: "Error fetching user profiles", description: error.message, variant: "destructive" });
    } else {
      setUserProfiles(prev => ({ ...prev, ...data.reduce((acc, p) => ({ ...acc, [p.user_id]: p }), {}) }));
    }
  }, [userProfiles, toast]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, categories: true }));
    const { data, error } = await supabase.from('forum_categories').select('*').order('name');
    if (error) toast({ title: "Error fetching categories", description: error.message, variant: "destructive" });
    else setCategories(data || []);
    setIsLoading(prev => ({ ...prev, categories: false }));
  }, [toast]);

  const fetchThreads = useCallback(async (categoryId) => {
    if (!categoryId) return;
    setIsLoading(prev => ({ ...prev, threads: true }));
    const { data, error } = await supabase.from('forum_threads')
      .select('*, author:profiles!user_id(fullname, avatar_url), reply_count:forum_posts(count)')
      .eq('category_id', categoryId)
      .order('is_pinned', { ascending: false })
      .order('last_reply_at', { ascending: false });

    if (error) toast({ title: "Error fetching threads", description: error.message, variant: "destructive" });
    else {
      setThreads(data || []);
      const userIds = data ? data.map(t => t.user_id).filter(Boolean) : [];
      if (userIds.length > 0) fetchUserProfiles(userIds);
    }
    setIsLoading(prev => ({ ...prev, threads: false }));
  }, [toast, fetchUserProfiles]);

  const fetchPosts = useCallback(async (threadId) => {
    if (!threadId) return;
    setIsLoading(prev => ({ ...prev, posts: true }));
    // Increment view count (fire and forget)
    supabase.rpc('increment_thread_view_count', { p_thread_id: threadId }).then().catch();


    const { data, error } = await supabase.from('forum_posts')
      .select('*, author:profiles!user_id(fullname, avatar_url), reactions:forum_reactions(*)')
      .eq('thread_id', threadId)
      .is('parent_post_id', null) // Fetch top-level posts
      .order('created_at');
      
    if (error) toast({ title: "Error fetching posts", description: error.message, variant: "destructive" });
    else {
      // Simple reply fetching for now, could be recursive or batched
      const postsWithReplies = await Promise.all((data || []).map(async post => {
        const { data: repliesData, error: repliesError } = await supabase.from('forum_posts')
          .select('*, author:profiles!user_id(fullname, avatar_url), reactions:forum_reactions(*)')
          .eq('parent_post_id', post.post_id)
          .order('created_at');
        if (repliesError) console.error("Error fetching replies for post " + post.post_id, repliesError);
        return { ...post, replies: repliesData || [] };
      }));

      setPosts(postsWithReplies);
      const userIds = postsWithReplies.flatMap(p => [p.user_id, ...(p.replies?.flatMap(r => [r.user_id, ...(r.reactions?.map(react => react.user_id) || [])]) || []), ...(p.reactions?.map(react => react.user_id) || [])]).filter(Boolean);
      if (userIds.length > 0) fetchUserProfiles(userIds);
    }
    setIsLoading(prev => ({ ...prev, posts: false }));
  }, [toast, fetchUserProfiles]);


  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { if (selectedCategory) fetchThreads(selectedCategory.category_id); else setThreads([]); }, [selectedCategory, fetchThreads]);
  useEffect(() => { if (selectedThread) fetchPosts(selectedThread.thread_id); else setPosts([]); }, [selectedThread, fetchPosts]);


  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!user || !selectedCategory || !newThreadTitle.trim() || !newThreadContent.trim()) return;
    setIsSubmitting(true);
    
    const { data: threadData, error: threadError } = await supabase.from('forum_threads')
      .insert({ category_id: selectedCategory.category_id, user_id: user.id, title: newThreadTitle, last_reply_at: new Date().toISOString() })
      .select()
      .single();

    if (threadError) {
      toast({ title: "Error creating thread", description: threadError.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const { error: postError } = await supabase.from('forum_posts')
      .insert({ thread_id: threadData.thread_id, user_id: user.id, content: newThreadContent });

    if (postError) {
      toast({ title: "Error creating initial post", description: postError.message, variant: "destructive" });
      // Optionally delete the created thread if post fails
    } else {
      toast({ title: "Thread Created", description: "Your new thread is live." });
      setShowNewThreadDialog(false);
      setNewThreadTitle('');
      setNewThreadContent('');
      fetchThreads(selectedCategory.category_id); // Refresh threads
      setSelectedThread(threadData); // Auto-select new thread
    }
    setIsSubmitting(false);
  };

  const handleCreatePost = async (threadId, content, parentPostId = null) => {
    if (!user || !content.trim() || !threadId) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('forum_posts')
      .insert({ thread_id: threadId, user_id: user.id, content, parent_post_id: parentPostId });

    if (error) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post Submitted", description: "Your reply has been added." });
      setNewPostContent(''); // Clear main reply box if used
      fetchPosts(threadId); // Refresh posts
      if (selectedCategory) fetchThreads(selectedCategory.category_id); // Refresh thread list to update reply counts/last reply times
    }
    setIsSubmitting(false);
  };
  
  const handleReactToPost = async (postId, reactionType) => {
    if (!user) return;

    // Check if user already reacted with this type
    const existingReaction = posts.flatMap(p => p.replies ? [p, ...p.replies] : [p]).find(p => p.post_id === postId)?.reactions?.find(r => r.user_id === user.id && r.reaction_type === reactionType);

    if (existingReaction) { // User is un-reacting
        const { error } = await supabase.from('forum_reactions').delete().match({ reaction_id: existingReaction.reaction_id });
        if (error) toast({ title: "Error un-reacting", description: error.message, variant: "destructive" });
        else fetchPosts(selectedThread.thread_id); // Refresh
    } else { // User is reacting
        const { error } = await supabase.from('forum_reactions').insert({ post_id: postId, user_id: user.id, reaction_type: reactionType });
        if (error) toast({ title: "Error reacting", description: error.message, variant: "destructive" });
        else fetchPosts(selectedThread.thread_id); // Refresh
    }
  };


  return (
    <div className="flex h-[calc(100vh-12rem)] border border-border rounded-lg overflow-hidden shadow-md">
      {/* Categories Panel */}
      <div className="w-1/4 min-w-[200px] max-w-[280px] bg-card-alt-themed border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <h3 className="text-md font-semibold text-foreground">Categories</h3>
        </div>
        <ScrollArea className="flex-1 p-2">
          {isLoading.categories ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin text-primary" /> :
            categories.map(cat => <ForumCategoryItem key={cat.category_id} category={cat} onSelectCategory={cat => { setSelectedCategory(cat); setSelectedThread(null); }} isActive={selectedCategory?.category_id === cat.category_id}/>)
          }
        </ScrollArea>
      </div>

      {/* Threads Panel */}
      <div className="w-1/3 min-w-[250px] max-w-[400px] bg-card-alt-themed border-r border-border flex flex-col">
        <div className="p-3 border-b border-border flex justify-between items-center">
          <h3 className="text-md font-semibold text-foreground">{selectedCategory ? selectedCategory.name : 'Select a Category'}</h3>
          {selectedCategory && (
            <Button size="sm" onClick={() => setShowNewThreadDialog(true)} className="ui-button-primary text-xs">
              <PlusCircle className="h-4 w-4 mr-1" /> New Thread
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1 p-2 space-y-2">
          {isLoading.threads && <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin text-primary" />}
          {!isLoading.threads && selectedCategory && threads.length === 0 && <p className="text-sm text-muted-foreground p-3">No threads in this category yet.</p>}
          {!isLoading.threads && threads.map(thread => <ThreadItem key={thread.thread_id} thread={thread} onSelectThread={setSelectedThread} userProfiles={userProfiles} />)}
        </ScrollArea>
      </div>

      {/* Posts Panel */}
      <div className="flex-1 bg-card-themed flex flex-col">
        <div className="p-3 border-b border-border">
          <h3 className="text-md font-semibold text-foreground">{selectedThread ? selectedThread.title : 'Select a Thread'}</h3>
          {selectedThread && <p className="text-xs text-muted-foreground">Viewing posts for this thread.</p>}
        </div>
        <ScrollArea className="flex-1 p-3">
          {isLoading.posts && <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin text-primary" />}
          {!isLoading.posts && selectedThread && posts.length === 0 && <p className="text-sm text-muted-foreground p-3">No posts in this thread yet. Be the first to reply!</p>}
          {!isLoading.posts && posts.map(post => <PostItem key={post.post_id} post={post} userProfiles={userProfiles} onReply={handleCreatePost} onReact={handleReactToPost} currentUserId={user?.id}/>)}
        </ScrollArea>
        {selectedThread && !selectedThread.is_locked && (
          <form onSubmit={(e) => { e.preventDefault(); handleCreatePost(selectedThread.thread_id, newPostContent); }} className="p-3 border-t border-border">
            <Textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Write a reply..." className="ui-textarea mb-2" />
            <Button type="submit" className="ui-button-primary w-full" disabled={isSubmitting || !newPostContent.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Post Reply
            </Button>
          </form>
        )}
         {selectedThread && selectedThread.is_locked && (
          <div className="p-3 border-t border-border text-center text-sm text-muted-foreground">
            <Lock className="inline h-4 w-4 mr-1" /> This thread is locked. No new replies can be added.
          </div>
        )}
      </div>

      {/* New Thread Dialog */}
      <Dialog open={showNewThreadDialog} onOpenChange={setShowNewThreadDialog}>
        <DialogContent className="bg-dialog-themed">
          <DialogHeader>
            <DialogTitle>Create New Thread in {selectedCategory?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateThread} className="space-y-4 py-2">
            <Input placeholder="Thread Title" value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)} required className="ui-input" />
            <Textarea placeholder="Your first post content..." value={newThreadContent} onChange={(e) => setNewThreadContent(e.target.value)} required rows={5} className="ui-textarea" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewThreadDialog(false)} className="ui-button-outline">Cancel</Button>
              <Button type="submit" className="ui-button-primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Thread
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumsTab;