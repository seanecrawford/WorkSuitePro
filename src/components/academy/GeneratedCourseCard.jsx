import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Target, BookText, ClipboardCheck, Sparkles, Save, Check, Loader2, FileText } from 'lucide-react';
import RegenerateButton from '@/components/academy/RegenerateButton';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GeneratedCourseCard = ({ course, index, onRegenerateSection, regeneratingSection, onSave, isSaving, isSaved, layout, isStreaming }) => {
  const { toast } = useToast();
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, delay: index * 0.1 }
    }
  };

  const isPrintLayout = layout === 'print';

  const objectives = course?.objectives || [];
  const modules = course?.modules || [];
  const checklist = course?.takeaway_checklist || [];
  const references = course?.references || [];

  const renderContent = (content, placeholder) => {
    if (isStreaming && !content) {
      return <Skeleton className="h-6 w-3/4" />;
    }
    return content || placeholder;
  };

  const renderList = (items, placeholder) => {
    if (isStreaming && (!items || items.length === 0)) {
      return Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full mb-2" />);
    }
    if (items && items.length > 0) {
      return items.map((item, i) => <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>);
    }
    return <li>{placeholder}</li>;
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
      <Card className={cn(
        "text-slate-100 overflow-hidden flex flex-col",
        isPrintLayout 
          ? "bg-white text-black border-gray-300 shadow-none" 
          : "bg-slate-800/50 border-slate-700/60 backdrop-blur-sm shadow-lg"
      )}>
        <CardHeader className={cn("flex-row justify-between items-center", isPrintLayout ? "border-b" : "bg-slate-900/30")}>
            <CardTitle className={cn(
              "text-2xl flex items-center gap-3",
              isPrintLayout ? "text-gray-900" : "text-sky-300"
            )}>
              <Sparkles className="h-6 w-6" />
              {renderContent(course.title, 'Generating Title...')}
            </CardTitle>
            <RegenerateButton courseId={course.id} sectionKey="title" onRegenerate={onRegenerateSection} regeneratingSection={regeneratingSection} />
        </CardHeader>
        <CardContent className="p-6 space-y-6 flex-grow">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className={cn("font-semibold text-lg flex items-center", isPrintLayout ? "text-gray-800" : "text-slate-200")}><Target className={cn("h-5 w-5 mr-2", isPrintLayout ? "text-blue-600" : "text-sky-400")}/>Learning Objectives</h4>
              <RegenerateButton courseId={course.id} sectionKey="objectives" onRegenerate={onRegenerateSection} regeneratingSection={regeneratingSection} />
            </div>
            <ul className={cn("list-disc list-inside space-y-1 pl-2", isPrintLayout ? "text-gray-700" : "text-slate-300")}>
              {renderList(objectives, 'Generating objectives...')}
            </ul>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h4 className={cn("font-semibold text-lg flex items-center", isPrintLayout ? "text-gray-800" : "text-slate-200")}><BookText className={cn("h-5 w-5 mr-2", isPrintLayout ? "text-blue-600" : "text-sky-400")}/>Modules</h4>
                <RegenerateButton courseId={course.id} sectionKey="modules" onRegenerate={onRegenerateSection} regeneratingSection={regeneratingSection} />
            </div>
            {isStreaming && modules.length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/20 space-y-4">
                    <Skeleton className="h-5 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : Array.isArray(modules) && modules.filter(Boolean).length > 0 ? modules.filter(Boolean).map((module, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-700 bg-slate-800/20 space-y-4">
                <h5 className="font-semibold text-md text-sky-300">{module.name || <Skeleton className="h-5 w-1/2" />}</h5>
                <p className="leading-relaxed text-slate-300">{module.lesson || <><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-5/6" /></>}</p>
                {Array.isArray(module.quiz) && module.quiz.map((q, qi) => (
                  <div key={qi} className={cn("p-3 rounded-md border-l-4", isPrintLayout ? "text-gray-700 bg-gray-100 border-blue-500" : "text-slate-300 bg-slate-800/40 border-sky-500")}>
                    <p className="font-medium">{q.question || <Skeleton className="h-5 w-3/4" />}</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                      {(q.options || []).map((opt, j) => <li key={j}>{opt}</li>)}
                    </ul>
                    {q.answerIndex !== undefined && (
                      <Button variant="link" className={cn("p-0 h-auto mt-2", isPrintLayout ? "text-blue-600 hover:text-blue-500" : "text-sky-400 hover:text-sky-300")} onClick={() => toast({ title: "Answer", description: q.options[q.answerIndex] })}>
                        Show Answer
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )) : <p className="text-slate-400">No modules generated.</p>}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className={cn("font-semibold text-lg flex items-center", isPrintLayout ? "text-gray-800" : "text-slate-200")}><ClipboardCheck className={cn("h-5 w-5 mr-2", isPrintLayout ? "text-blue-600" : "text-sky-400")}/>Takeaway Checklist</h4>
              <RegenerateButton courseId={course.id} sectionKey="takeaway_checklist" onRegenerate={onRegenerateSection} regeneratingSection={regeneratingSection} />
            </div>
            <ul className={cn("space-y-2", isPrintLayout ? "text-gray-700" : "text-slate-300")}>
              {isStreaming && checklist.length === 0 ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-4 w-full mb-2" />)
              ) : checklist.map((item, i) => (
                <li key={i} className="flex items-start">
                  <ClipboardCheck className={cn("h-4 w-4 mr-2 mt-1 flex-shrink-0", isPrintLayout ? "text-green-600" : "text-green-400")}/>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className={cn("font-semibold text-lg flex items-center", isPrintLayout ? "text-gray-800" : "text-slate-200")}><FileText className={cn("h-5 w-5 mr-2", isPrintLayout ? "text-blue-600" : "text-sky-400")}/>References</h4>
              <RegenerateButton courseId={course.id} sectionKey="references" onRegenerate={onRegenerateSection} regeneratingSection={regeneratingSection} />
            </div>
            <ul className={cn("list-disc list-inside space-y-1 pl-2", isPrintLayout ? "text-gray-600 text-sm" : "text-slate-400 text-sm")}>
              {renderList(references, 'Generating references...')}
            </ul>
          </div>

        </CardContent>
        <div className="p-6 pt-0">
          <Button
            onClick={() => onSave(course)}
            disabled={isSaving || isSaved || isStreaming}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 disabled:text-slate-400"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : isSaved ? (
              <><Check className="mr-2 h-4 w-4" /> Saved to Library</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save to Library</>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default GeneratedCourseCard;