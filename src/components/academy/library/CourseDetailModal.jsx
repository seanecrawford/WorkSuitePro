import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { BookUser, Calendar, CheckCircle, Download, FileArchive, HelpCircle, Target, BookText, ClipboardCheck, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CourseDetailModal = ({ course, isOpen, onClose, onProgressUpdate }) => {
  const { toast } = useToast();
  const [completedModules, setCompletedModules] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState({});
  const contentRef = useRef(null);

  const courseData = course?.course_data || {};
  const modules = courseData.modules || [];
  const totalProgressItems = modules.length;

  useEffect(() => {
    if (course?.progress) {
      setCompletedModules(course.progress);
    } else {
      setCompletedModules({});
    }
    setQuizAnswers({});
    setQuizFeedback({});
  }, [course]);

  if (!course) return null;

  const completedCount = Object.values(completedModules).filter(Boolean).length;
  const progressPercentage = totalProgressItems > 0 ? (completedCount / totalProgressItems) * 100 : 0;

  const handleToggleComplete = async (moduleId) => {
    const newCompletedModules = { ...completedModules, [moduleId]: !completedModules[moduleId] };
    setCompletedModules(newCompletedModules);

    const { error } = await supabase
      .from('courses')
      .update({ progress: newCompletedModules })
      .eq('id', course.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save progress.', variant: 'destructive' });
    } else {
      onProgressUpdate(course.id, newCompletedModules);
    }
  };

  const handleQuizSubmit = (moduleIndex, quizIndex) => {
    const quiz = modules[moduleIndex]?.quiz[quizIndex];
    const answerKey = `${moduleIndex}-${quizIndex}`;
    const selectedAnswer = quizAnswers[answerKey];
    if (!selectedAnswer) {
      toast({ title: 'No Answer Selected', description: 'Please select an answer before checking.', variant: 'destructive' });
      return;
    }
    const isCorrect = selectedAnswer === quiz.options[quiz.answerIndex];
    setQuizFeedback({ ...quizFeedback, [answerKey]: { submitted: true, isCorrect } });
  };

  const handleDownloadPdf = () => {
    const input = contentRef.current;
    if (!input) return;

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#111827' 
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth;
      const height = width / ratio;
      
      let position = 0;
      let remainingHeight = canvasHeight;
      
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        remainingHeight -= canvas.height;
        if (remainingHeight > 0) {
          pdf.addPage();
          position = -pdfHeight;
        }
      }
      pdf.save(`${course.title.replace(/ /g, '_')}.pdf`);
    });
  };

  const handleExportScorm = () => {
    toast({
      title: "Feature Not Implemented",
      description: "SCORM export is not yet available, but we're working on it!",
    });
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="pb-8 border-b border-slate-800 last:border-b-0">
      <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-3 mb-4">
        <Icon className="h-6 w-6 text-sky-400" />
        {title}
      </h3>
      <div className="prose prose-invert prose-sm max-w-none text-slate-300 pl-9">
        {children}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-slate-900 border-slate-700 text-white flex flex-col">
        <div ref={contentRef} className="bg-slate-900 text-white p-6">
          <DialogHeader className="text-left border-b border-slate-700 pb-4 mb-6">
            <DialogTitle className="text-3xl font-bold text-sky-300">{course.title}</DialogTitle>
            <DialogDescription className="text-slate-400 flex items-center gap-4 pt-2">
              <span className="flex items-center gap-2"><BookUser className="h-4 w-4" />Author: AI Generator</span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />Created: {format(new Date(course.created_at), 'PPP')}</span>
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <ScrollArea className="flex-grow px-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-slate-300">Progress</Label>
              <span className="text-sm text-sky-300">{completedCount} of {totalProgressItems} modules complete</span>
            </div>
            <Progress value={progressPercentage} className="w-full bg-slate-700" />
          </div>

          <div className="space-y-8">
            <Section icon={Target} title="Learning Objectives">
              <ul className="list-disc list-inside space-y-1">
                {(courseData.objectives || []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </Section>

            {Array.isArray(modules) && modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <Checkbox
                    id={`module-${moduleIndex}`}
                    checked={!!completedModules[moduleIndex]}
                    onCheckedChange={() => handleToggleComplete(moduleIndex)}
                    className="h-6 w-6 border-slate-500 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                  />
                </div>
                <div className="flex-1">
                  <Section icon={BookText} title={`Module ${moduleIndex + 1}: ${module.name}`}>
                    <p>{module.lesson}</p>
                    {Array.isArray(module.quiz) && module.quiz.length > 0 && (
                      <div className="mt-6 space-y-6">
                        <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-3">
                          <HelpCircle className="h-5 w-5 text-sky-400" />
                          Knowledge Check
                        </h4>
                        {module.quiz.map((q, quizIndex) => {
                          const answerKey = `${moduleIndex}-${quizIndex}`;
                          const correctAnswer = q.options[q.answerIndex];
                          return (
                            <div key={quizIndex} className="bg-slate-800/50 p-4 rounded-lg">
                              <p className="font-medium mb-3">{q.question}</p>
                              <RadioGroup
                                value={quizAnswers[answerKey]}
                                onValueChange={(value) => setQuizAnswers({ ...quizAnswers, [answerKey]: value })}
                                disabled={quizFeedback[answerKey]?.submitted}
                              >
                                {q.options.map((opt, j) => (
                                  <div key={j} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt} id={`m${moduleIndex}q${quizIndex}-opt${j}`} />
                                    <Label htmlFor={`m${moduleIndex}q${quizIndex}-opt${j}`}>{opt}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                              {!quizFeedback[answerKey]?.submitted ? (
                                <Button size="sm" className="mt-4" onClick={() => handleQuizSubmit(moduleIndex, quizIndex)}>Check Answer</Button>
                              ) : (
                                <div className={`mt-4 flex items-center gap-2 text-sm p-2 rounded-md ${quizFeedback[answerKey].isCorrect ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                  {quizFeedback[answerKey].isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                  <span>{quizFeedback[answerKey].isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${correctAnswer}`}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Section>
                </div>
              </div>
            ))}

            <Section icon={ClipboardCheck} title="Takeaway Checklist">
              <ul className="list-disc list-inside space-y-1">
                {(courseData.takeaway_checklist || []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </Section>

            <Section icon={FileText} title="References">
              <ul className="list-disc list-inside space-y-1 text-xs">
                {(courseData.references || []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </Section>
          </div>
        </ScrollArea>

        <DialogFooter className="bg-slate-900 border-t border-slate-700 p-4 flex-row justify-end gap-2 mt-auto">
          <Button variant="outline" onClick={handleDownloadPdf} className="border-sky-500 text-sky-500 hover:bg-sky-500/10 hover:text-sky-400">
            <Download className="mr-2 h-4 w-4" /> Download as PDF
          </Button>
          <Button variant="outline" onClick={handleExportScorm} className="border-slate-500 text-slate-300 hover:bg-slate-500/10 hover:text-slate-200">
            <FileArchive className="mr-2 h-4 w-4" /> Export to SCORM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailModal;