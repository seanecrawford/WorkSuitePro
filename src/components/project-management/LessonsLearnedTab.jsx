import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, PlusCircle, Eye } from 'lucide-react';
import ProjectDataForm from './ProjectDataForm';
import { format, parseISO } from 'date-fns';

const LessonsLearnedTab = ({ integerProjectId, projectName }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewLessonDialog, setShowNewLessonDialog] = useState(false);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const { toast } = useToast();

  const currentProjectId = integerProjectId; 

  const fetchLessons = useCallback(async () => {
    if (!currentProjectId) {
      setLessons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('lessons_learned') 
        .select('lesson_uid, projectid, category, description, impact, recommendation, logged_date')
        .eq('projectid', currentProjectId) 
        .order('logged_date', { ascending: false });
      if (dbError) throw dbError;
      setLessons(data || []);
    } catch (err) {
      console.error("Error fetching lessons learned:", err);
      const errorMessage = err.message || "Failed to fetch lessons learned.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Error Loading Lessons", description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [toast, currentProjectId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons, currentProjectId]);

  const lessonFormFields = [
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Process, Technical, Communication' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the lesson learned' },
    { name: 'impact', label: 'Impact', type: 'textarea', placeholder: 'Describe the impact of this lesson' },
    { name: 'recommendation', label: 'Recommendation', type: 'textarea', placeholder: 'Provide recommendations for future projects' },
    { name: 'logged_date', label: 'Logged Date', type: 'date', required: true, placeholder: 'Select date' },
  ];

  const handleNewLessonSubmit = async (formData) => {
    if (!currentProjectId) {
      toast({ variant: "destructive", title: "Error", description: "No project selected." });
      return;
    }
    setFormIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        projectid: currentProjectId 
      };
      const { data, error: insertError } = await supabase
        .from('lessons_learned')
        .insert([submissionData])
        .select();

      if (insertError) throw insertError;

      toast({ title: "Lesson Added", description: `Lesson "${formData.description.substring(0,30)}..." has been successfully added.` });
      setShowNewLessonDialog(false);
      fetchLessons(); 
    } catch (err) {
      console.error("Error adding lesson:", err);
      const errorMessage = err.message || "Failed to add lesson.";
      toast({ variant: "destructive", title: "Error Adding Lesson", description: errorMessage });
    } finally {
      setFormIsLoading(false);
    }
  };
  
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString; 
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error && !lessons.length) return <div className="text-destructive p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{error}</div>;
  
  return (
    <Card className="bg-card border-border text-foreground">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-accent-foreground">Lessons Learned for: <span className="text-primary">{projectName || "Selected Project"}</span></CardTitle>
          <CardDescription className="text-muted-foreground">Insights and knowledge gained from this project.</CardDescription>
        </div>
        <Dialog open={showNewLessonDialog} onOpenChange={setShowNewLessonDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-accent-foreground">Add New Lesson for {projectName}</DialogTitle>
              <DialogDescription className="text-muted-foreground">Fill in the details for the new lesson.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <ProjectDataForm
                fields={lessonFormFields}
                initialData={{ projectid: currentProjectId }}
                onSubmit={handleNewLessonSubmit}
                isLoading={formIsLoading}
                submitButtonText="Add Lesson"
                onCancel={() => setShowNewLessonDialog(false)}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 text-destructive p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{error}</div>}
         {lessons.length === 0 && !loading ? (
           <p className="text-muted-foreground text-center py-8">No lessons learned have been logged for this project. Click "Add Lesson" to create one.</p>
        ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader className="bg-table-header-themed">
              <TableRow className="border-table-cell-themed">
                <TableHead className="text-table-header-themed">Category</TableHead>
                <TableHead className="text-table-header-themed">Description</TableHead>
                <TableHead className="text-table-header-themed">Impact</TableHead>
                <TableHead className="text-table-header-themed">Recommendation</TableHead>
                <TableHead className="text-table-header-themed">Logged Date</TableHead>
                <TableHead className="text-center text-table-header-themed">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.lesson_uid} className="border-table-cell-themed hover-row-themed">
                  <TableCell className="text-muted-foreground">{lesson.category}</TableCell>
                  <TableCell className="max-w-xs truncate text-foreground">{lesson.description}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{lesson.impact}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{lesson.recommendation}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateDisplay(lesson.logged_date)}</TableCell>
                  <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="text-accent-foreground hover:text-primary hover:bg-accent">
                        <Eye className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonsLearnedTab;