import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Loader2, RefreshCw } from 'lucide-react';
    
    const RegenerateButton = ({ courseId, sectionKey, onRegenerate, regeneratingSection }) => {
      const isLoading = regeneratingSection?.courseId === courseId && regeneratingSection?.section === sectionKey;
      const isAnotherSectionLoading = regeneratingSection && regeneratingSection.courseId === courseId && !isLoading;
    
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRegenerate(courseId, sectionKey)}
          disabled={isLoading || isAnotherSectionLoading}
          className="h-7 w-7 text-slate-400 hover:text-sky-400 disabled:opacity-50"
          aria-label={`Regenerate ${sectionKey}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      );
    };
    
    export default RegenerateButton;