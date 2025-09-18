import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Library, Sun, Moon, BookOpen } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const AcademyHeader = ({
  trainingGoal,
  setTrainingGoal,
  handleGenerateCourse,
  isLoading,
  onPresetSelect,
  onToggleLibrary
}) => {
  const { theme, setTheme } = useTheme();

  const presets = [
    { id: 'onboarding', label: 'Onboarding 101', goal: 'Create a comprehensive onboarding plan for new software engineers.', options: { purpose: 'Teaching Others', audience: 'Beginner', format: 'Deep Dive', addQuiz: 'Yes' } },
    { id: 'agile', label: 'Agile Sprint Planning', goal: 'Teach a team how to effectively plan an agile sprint.', options: { purpose: 'Teaching Others', audience: 'Advanced', format: 'Quick Guide', addQuiz: 'No' } },
    { id: 'python', label: 'Intro to Python', goal: 'Learn the basics of Python programming for data analysis.', options: { purpose: 'Learning for Myself', audience: 'Beginner', format: 'Deep Dive', addQuiz: 'Yes' } },
    { id: 'feedback', label: 'Giving Feedback', goal: 'Train managers on how to deliver constructive feedback.', options: { purpose: 'Teaching Others', audience: 'Advanced', format: 'Quick Guide', addQuiz: 'Yes' } },
    { id: 'sales', label: 'Sales Pitch Practice', goal: 'Develop a compelling sales pitch for a new SaaS product.', options: { purpose: 'Learning for Myself', audience: 'Beginner', format: 'Quick Guide', addQuiz: 'No' } },
  ];

  const handlePresetChange = (presetId) => {
    const selectedPreset = presets.find(p => p.id === presetId);
    if (selectedPreset) {
      onPresetSelect(selectedPreset);
    }
  };

  return (
    <header className="flex-shrink-0 bg-background/80 backdrop-blur-lg p-3 border-b border-border shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold hidden sm:block">Academy</h1>
            </div>
            
            <div className="flex-grow flex items-center justify-center gap-2 px-4">
                <Input
                    id="training-goal"
                    placeholder="Enter your training goal..."
                    value={trainingGoal}
                    onChange={(e) => setTrainingGoal(e.target.value)}
                    className="max-w-xl bg-background text-base"
                />
                 <Button
                    onClick={handleGenerateCourse}
                    disabled={isLoading}
                    className="w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-md shadow-lg"
                >
                    {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                    )}
                    Generate
                </Button>
            </div>
            
            <div className="flex items-center gap-2">
                 <Select onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-full md:w-[150px] bg-background border-input">
                        <SelectValue placeholder="Templates" />
                    </SelectTrigger>
                    <SelectContent className="template-dropdown-content">
                        {presets.map(preset => (
                            <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button variant="outline" size="icon" onClick={onToggleLibrary}>
                    <Library className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </div>
    </header>
  );
};

export default AcademyHeader;