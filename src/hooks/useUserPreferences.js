import { useState, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/use-toast';

export const useUserPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useLocalStorage('user_preferences', {
    recent_goals: [],
    theme: 'dark',
    layout: 'web',
  });
  const [loading, setLoading] = useState(false);

  const updatePreferences = useCallback(async (newPrefs) => {
    setPreferences(prev => ({...prev, ...newPrefs}));
  }, [setPreferences]);

  const addRecentGoal = useCallback((goal) => {
    if (!goal) return;
    
    setPreferences(prev => {
        const updatedGoals = [goal, ...prev.recent_goals.filter(g => g !== goal)].slice(0, 5);
        return {...prev, recent_goals: updatedGoals};
    });

  }, [setPreferences]);

  return { preferences, loading, updatePreferences, addRecentGoal };
};