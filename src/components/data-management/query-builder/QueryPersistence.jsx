import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QueryHistoryPanel = ({ showHistory, queryHistory, onLoadQueryFromHistory, onClearQueryHistory }) => (
  <AnimatePresence>
    {showHistory && queryHistory.length > 0 && (
      <motion.div 
        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
        className="px-6 pb-4 overflow-hidden"
      >
        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader className="py-2 px-3 flex flex-row justify-between items-center">
            <CardTitle className="text-sm text-slate-300">Query History</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClearQueryHistory} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">Clear</Button>
          </CardHeader>
          <CardContent className="p-0 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
            <ul className="divide-y divide-slate-700">
              {queryHistory.map((item, index) => (
                <li key={index} className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700/50 cursor-pointer" onClick={() => onLoadQueryFromHistory(item)}>
                  <span className="font-mono block truncate">{item.type === 'filters' ? `Filters on ${item.table || 'unknown table'}` : item.query}</span>
                  <span className="text-slate-500 text-[10px]">{new Date(item.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    )}
    {showHistory && queryHistory.length === 0 && (
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-4 text-center text-sm text-slate-500">No query history yet.</motion.div>
    )}
  </AnimatePresence>
);

export const SavedQueriesPanel = ({ showSavedQueries, savedQueries, handleLoadSavedQuery, onDeleteSavedQuery }) => (
  <AnimatePresence>
    {showSavedQueries && savedQueries.length > 0 && (
      <motion.div 
        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
        className="px-6 pb-4 overflow-hidden"
      >
        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm text-slate-300">Saved Queries</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
            <ul className="divide-y divide-slate-700">
              {savedQueries.map((sq) => (
                <li key={sq.id} className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700/50 flex justify-between items-center">
                  <div className="cursor-pointer flex-grow" onClick={() => handleLoadSavedQuery(sq)}>
                    <span className="font-semibold block truncate text-slate-300">{sq.name}</span>
                    <span className="text-slate-500 text-[10px]">Table: {sq.queryData.table || 'N/A'} - Type: {sq.queryData.type}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteSavedQuery(sq.id)} className="h-6 w-6 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    )}
    {showSavedQueries && savedQueries.length === 0 && (
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-4 text-center text-sm text-slate-500">No saved queries yet.</motion.div>
    )}
  </AnimatePresence>
);

export const SaveQueryControls = ({ saveQueryName, setSaveQueryName, handleSaveQuery }) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <Input 
      type="text" 
      placeholder="Query Name (for saving)" 
      value={saveQueryName}
      onChange={(e) => setSaveQueryName(e.target.value)}
      className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 flex-grow"
    />
    <Button onClick={handleSaveQuery} variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 hover:text-green-300">
      Save Query
    </Button>
  </div>
);