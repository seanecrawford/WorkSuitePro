import React from 'react';
import { Button } from '@/components/ui/button';
import { History, Zap } from 'lucide-react';

const SuggestionChips = ({ recentGoals, onSuggestionClick }) => {
  const popularTopics = ['Vue.js Basics', 'Project Management Fundamentals', 'Advanced CSS Techniques'];

  return (
    <div>
      {recentGoals && recentGoals.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center"><History className="h-3 w-3 mr-1.5" />Recent Goals</h4>
          <div className="flex flex-wrap gap-2">
            {recentGoals.map((goal, index) => (
              <Button key={index} variant="outline" size="sm" className="text-xs h-auto py-1 px-2.5 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => onSuggestionClick(goal)}>
                {goal}
              </Button>
            ))}
          </div>
        </div>
      )}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center"><Zap className="h-3 w-3 mr-1.5" />Popular Topics</h4>
        <div className="flex flex-wrap gap-2">
          {popularTopics.map((topic, index) => (
            <Button key={index} variant="outline" size="sm" className="text-xs h-auto py-1 px-2.5 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => onSuggestionClick(topic)}>
              {topic}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionChips;