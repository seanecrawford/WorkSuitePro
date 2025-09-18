import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckSquare, Settings, Zap, AlertTriangle, Info, ListChecks } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const FieldMappingStep = ({ formData, updateFormData }) => {
  // This is a conceptual step. Actual drag-and-drop and AI suggestions are complex.
  // We'll display selected tables and a placeholder for mapping UI.

  const { selectedTables, sourceName } = formData;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-xl font-semibold text-foreground">Field Mapping (Conceptual)</h2>
      <p className="text-muted-foreground">
        Define how columns from your selected tables in <strong className="text-primary">{sourceName}</strong> map to Work Suite Pro features.
      </p>

      {selectedTables.length === 0 ? (
        <Alert className="bg-amber-900/30 border-amber-700/50 text-amber-200">
          <Info className="h-5 w-5 text-amber-400" />
          <AlertTitle className="text-amber-300">No Tables Selected</AlertTitle>
          <AlertDescription>
            Please go back to the previous step to select tables for mapping. If you don't need to map specific fields now, you can proceed.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="bg-card/70 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="h-5 w-5 mr-2 text-primary"/>Selected Tables for Mapping</CardTitle>
            <CardDescription>Below are the tables you've chosen from <strong className="text-primary">{sourceName}</strong>. Advanced mapping tools are coming soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px] border border-border rounded-md p-3 bg-background/50">
              {selectedTables.map(tableName => (
                <div key={tableName} className="flex items-center p-2 mb-1 bg-accent/30 rounded">
                  <CheckSquare className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm text-foreground">{tableName}</span>
                </div>
              ))}
            </ScrollArea>
            
            <Alert className="mt-4 bg-sky-900/40 border-sky-700/60">
              <Zap className="h-5 w-5 text-sky-400" />
              <AlertTitle className="text-sky-300">AI-Assisted Mapping (Coming Soon)</AlertTitle>
              <AlertDescription className="text-sky-200/80 text-xs">
                Work Suite Pro will soon offer AI-powered suggestions to automatically map matching field names and compatible data types, streamlining your setup.
              </AlertDescription>
            </Alert>

            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-md font-semibold text-foreground mb-2 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-muted-foreground"/> Placeholder: Mapping Interface
                </h4>
                <p className="text-sm text-muted-foreground">
                    Imagine a drag-and-drop interface here, allowing you to connect columns from your tables (e.g., <code className="bg-slate-700 px-1 py-0.5 rounded text-xs text-primary">{selectedTables[0] || 'your_table'}.email_address</code>) 
                    to Work Suite Pro fields (e.g., <code className="bg-slate-700 px-1 py-0.5 rounded text-xs text-primary">User.Email</code>).
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    You would also see validation warnings for missing required fields or incompatible data types, and a real-time preview of how mapped data might appear in dashboards.
                </p>
            </div>

          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default FieldMappingStep;