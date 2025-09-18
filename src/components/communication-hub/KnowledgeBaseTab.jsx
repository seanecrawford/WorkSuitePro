import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNowStrict } from 'date-fns';
import { PlusCircle, Edit, Loader2 } from 'lucide-react';

const KnowledgeBaseArticleForm = ({ onSave, article, dialogOpen, setDialogOpen, categories }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (dialogOpen) {
      if (article) {
        setTitle(article.title);
        setContent(article.content);
        setCategoryId(article.category_id || '');
        setTags(article.tags?.join(', ') || '');
        setIsPublished(article.is_published);
      } else {
        setTitle(''); setContent(''); setCategoryId(''); setTags(''); setIsPublished(false);
      }
    }
  }, [article, dialogOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const articleData = {
      user_id: user.id,
      last_edited_by: user.id,
      title,
      content,
      category_id: categoryId || null,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      version: article ? (article.version || 0) + 1 : 1,
    };

    try {
      let response;
      if (article?.article_id) {
        response = await supabase.from('knowledge_base_articles').update(articleData).eq('article_id', article.article_id).select().single();
      } else {
        response = await supabase.from('knowledge_base_articles').insert(articleData).select().single();
      }

      if (response.error) throw response.error;
      toast({ title: "Success", description: `Article ${article ? 'updated' : 'created'}.` });
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
      <DialogContent className="sm:max-w-2xl bg-dialog-themed text-dialog-themed-foreground border-border">
        <DialogHeader>
          <DialogTitle>{article ? 'Edit' : 'Create'} Knowledge Base Article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input id="title" placeholder="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="ui-input" />
          <Textarea id="content" placeholder="Article Content (Markdown supported)" value={content} onChange={(e) => setContent(e.target.value)} required rows={10} className="ui-textarea" />
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="ui-input">
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
          </select>
          <Input id="tags" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} className="ui-input" />
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isKBPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="isKBPublished" className="text-sm font-medium text-muted-foreground">Publish Article</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="ui-button-outline">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="ui-button-primary">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {article ? 'Save Changes' : 'Create Article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const KnowledgeBaseTab = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchKBData = useCallback(async () => {
    setIsLoading(true);
    const [articlesRes, categoriesRes] = await Promise.all([
      supabase.from('knowledge_base_articles').select('*, category:knowledge_base_categories!inner(name), author:profiles!inner!user_id(full_name)').eq('is_published', true).order('created_at', { ascending: false }),
      supabase.from('knowledge_base_categories').select('*').order('name')
    ]);

    if (articlesRes.error) {
        console.error("Error fetching articles:", articlesRes.error);
        toast({ title: "Error fetching articles", description: articlesRes.error.message, variant: "destructive" });
        setArticles([]);
    } else setArticles(articlesRes.data || []);

    if (categoriesRes.error) {
        console.error("Error fetching categories:", categoriesRes.error);
        toast({ title: "Error fetching categories", description: categoriesRes.error.message, variant: "destructive" });
        setCategories([]);
    } else setCategories(categoriesRes.data || []);
    
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchKBData();
  }, [fetchKBData]);

  const handleSave = () => {
    fetchKBData(); 
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.category?.name && article.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2 text-muted-foreground">Loading knowledge base...</span></div>;


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input 
          placeholder="Search articles..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="ui-input max-w-sm"
        />
        <Button onClick={() => { setSelectedArticle(null); setFormOpen(true); }} className="ui-button-primary w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Article
        </Button>
      </div>
      <KnowledgeBaseArticleForm article={selectedArticle} onSave={handleSave} dialogOpen={formOpen} setDialogOpen={setFormOpen} categories={categories} />
      
      {filteredArticles.length === 0 ? (
         <Card className="bg-card-themed">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No articles found matching your search, or no articles exist yet.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((item) => (
              <Card key={item.article_id} className="bg-card-themed flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg hover:text-primary cursor-pointer" onClick={() => alert(`Viewing article: ${item.title}`)}>{item.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Category: {item.category?.name || 'Uncategorized'} | Version: {item.version}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-foreground line-clamp-3">{item.content.substring(0,150)}...</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map(tag => <span key={tag} className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{tag}</span>)}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground justify-between items-center">
                  <span>By {item.author?.full_name || 'System'}</span>
                  <span>{formatDistanceToNowStrict(new Date(item.updated_at), { addSuffix: true })}</span>
                  {item.user_id === user?.id && (
                     <Button variant="ghost" size="sm" onClick={() => { setSelectedArticle(item); setFormOpen(true); }} className="p-1 h-auto">
                        <Edit className="h-3 w-3" />
                      </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default KnowledgeBaseTab;