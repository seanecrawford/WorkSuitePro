import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import useLocalStorage from '@/hooks/useLocalStorage';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import AcademyHeader from '@/components/academy/AcademyHeader';
import GeneratedCourseCard from '@/components/academy/GeneratedCourseCard';
import LibraryDrawer from '@/components/academy/library/LibraryDrawer';
import GenerationLoader from '@/components/academy/GenerationLoader';
import { generateCourseContent, regenerateCourseSection } from '@/lib/courseGenerator';
import { supabase } from '@/lib/supabaseClient';

const WorkSuiteAcademyPage = () => {
  const { preferences, addRecentGoal } = useUserPreferences();
  
  const [trainingGoal, setTrainingGoal] = useLocalStorage('academy_draft_goal', '');
  const [generatedCourses, setGeneratedCourses] = useLocalStorage('academy_draft_courses', []);
  
  const [options, setOptions] = useState({
    purpose: 'Teaching Others',
    audience: 'Beginner',
    format: 'Quick Guide',
    addQuiz: 'No',
  });
  const [libraryCourses, setLibraryCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [savingStates, setSavingStates] = useState({});
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchLibraryCourses = useCallback(async () => {
    // In a non-auth app, we can show sample data or an empty state.
    setIsLibraryLoading(true);
    // Mocking an empty library for now.
    setLibraryCourses([]);
    setIsLibraryLoading(false);
  }, []);

  useEffect(() => {
    if (isLibraryDrawerOpen) {
      fetchLibraryCourses();
    }
  }, [isLibraryDrawerOpen, fetchLibraryCourses]);

  const handleGenerateCourse = useCallback(async () => {
    if (!trainingGoal.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a training goal.",
        variant: "destructive",
      });
      return;
    }
    setError(null);
    setIsLoading(true);
    const tempId = `course_${Date.now()}`;
    setGeneratedCourses([{ 
        id: tempId, 
        title: 'Generating course...', 
        isStreaming: true,
        originalGoal: trainingGoal,
        options: options
    }]);

    try {
        const finalCourse = await generateCourseContent(trainingGoal, options, (chunk) => {
            setGeneratedCourses(prev => prev.map(c => c.id === tempId ? { ...c, ...chunk } : c));
        });
        
        setGeneratedCourses(prev => prev.map(c => c.id === tempId ? { ...finalCourse, id: tempId, originalGoal: trainingGoal, options: options, isStreaming: false } : c));
        
        addRecentGoal(trainingGoal);
        toast({
          title: "Course Generated!",
          description: "Your new learning module is ready.",
        });
    } catch (error) {
        console.error(error);
        setError({ title: "Generation Failed", message: error.message });
        setGeneratedCourses([]);
    } finally {
        setIsLoading(false);
    }
  }, [trainingGoal, options, toast, setGeneratedCourses, addRecentGoal]);

  const handleRegenerateSection = useCallback(async (courseId, sectionKey) => {
    setRegeneratingSection({ courseId, sectionKey });
    
    const courseToUpdate = generatedCourses.find(c => c.id === courseId);
    if (!courseToUpdate) return;

    try {
        const newContent = await regenerateCourseSection(sectionKey, courseToUpdate.originalGoal, courseToUpdate.options, courseToUpdate);
        
        setGeneratedCourses(courses => courses.map(course => {
          if (course.id === courseId) {
            return { ...course, [sectionKey]: newContent };
          }
          return course;
        }));
        
        toast({ title: `Section Regenerated!`, description: `The '${sectionKey}' section has been updated.` });
    } catch(error) {
        console.error(error);
        toast({ title: "Regeneration Failed", description: error.message, variant: "destructive" });
    } finally {
        setRegeneratingSection(null);
    }
  }, [generatedCourses, toast, setGeneratedCourses]);

  const handleSaveCourse = async (courseToSave) => {
    toast({ title: "Save Disabled", description: "Saving courses requires an account. This is a demo.", variant: "default" });
    setSavingStates(prev => ({ ...prev, [courseToSave.id]: { isSaving: true, isSaved: false } }));
    setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [courseToSave.id]: { isSaving: false, isSaved: true } }));
    }, 1000);
  };
  
  const handleProgressUpdate = (courseId, newProgress) => {
    setLibraryCourses(prev => prev.map(c => c.id === courseId ? {...c, progress: newProgress} : c));
  };

  const handlePresetSelect = (preset) => {
    setTrainingGoal(preset.goal);
    setOptions(preset.options);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <AcademyHeader
        trainingGoal={trainingGoal}
        setTrainingGoal={setTrainingGoal}
        handleGenerateCourse={handleGenerateCourse}
        isLoading={isLoading}
        onPresetSelect={handlePresetSelect}
        onToggleLibrary={() => setIsLibraryDrawerOpen(!isLibraryDrawerOpen)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <AnimatePresence>
                {isLoading && <GenerationLoader />}
            </AnimatePresence>

            {!isLoading && error && (
                <Alert variant="destructive" className="my-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{error.title}</AlertTitle>
                    <AlertDescription>{error.message} Please check the console for more details and try again.</AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && generatedCourses.length > 0 && (
                 <motion.div
                    className="space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {generatedCourses.map((course, index) => (
                    <GeneratedCourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        onRegenerateSection={handleRegenerateSection}
                        regeneratingSection={regeneratingSection}
                        onSave={handleSaveCourse}
                        isSaving={savingStates[course.id]?.isSaving}
                        isSaved={savingStates[course.id]?.isSaved}
                        layout={'web'}
                        isStreaming={course.isStreaming}
                    />
                    ))}
                </motion.div>
            )}

            {!isLoading && !error && generatedCourses.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                    <Bot className="h-24 w-24 mb-6 opacity-50" />
                    <h2 className="text-2xl font-semibold text-foreground">Welcome to the AI Course Generator</h2>
                    <p className="mt-2 max-w-md">
                        Describe a learning objective in the header above, and watch as a complete micro-course is generated for you instantly.
                    </p>
                </div>
            )}
        </div>
      </main>

      <LibraryDrawer
        courses={libraryCourses}
        isLoading={isLibraryLoading}
        onProgressUpdate={handleProgressUpdate}
        isOpen={isLibraryDrawerOpen}
        onClose={() => setIsLibraryDrawerOpen(false)}
      />
    </div>
  );
};

export default WorkSuiteAcademyPage;