import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import FilterRow from './FilterRow'; // Assuming FilterRow is in the same directory

const QueryTabs = ({
  activeTab,
  setActiveTab,
  filters,
  addFilter,
  updateFilter,
  removeFilter,
  availableColumns,
  selectedTable,
  parentCustomQuery,
  parentSetCustomQuery
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
        <TabsTrigger value="filters" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white">Filter Builder</TabsTrigger>
        <TabsTrigger value="customSql" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white">Custom SQL</TabsTrigger>
      </TabsList>
      <TabsContent value="filters" className="mt-4 space-y-4">
        <AnimatePresence>
          {filters.map((filter) => (
            <FilterRow
              key={filter.id}
              filter={filter}
              onUpdate={updateFilter}
              onRemove={() => removeFilter(filter.id)}
              availableColumns={availableColumns}
            />
          ))}
        </AnimatePresence>
        <Button onClick={addFilter} variant="outline" size="sm" className="border-sky-500 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300" disabled={!selectedTable}>
          Add Filter
        </Button>
      </TabsContent>
      <TabsContent value="customSql" className="mt-4">
        <Label htmlFor="customQuery" className="text-slate-300 mb-1 block">SQL Query</Label>
        <Textarea
          id="customQuery"
          placeholder={`SELECT * FROM public."${selectedTable || 'your_table'}" WHERE condition;`}
          value={parentCustomQuery}
          onChange={(e) => parentSetCustomQuery(e.target.value)}
          className="min-h-[120px] bg-slate-800 border-slate-600 text-slate-100 font-mono text-sm placeholder-slate-500 focus:border-sky-500"
        />
        <Alert variant="default" className="mt-2 bg-slate-800 border-sky-500/50 text-sky-300">
          <Info className="h-4 w-4 !text-sky-400" />
          <AlertTitle className="text-sky-300">Info</AlertTitle>
          <AlertDescription className="text-sky-400/90 text-xs">
            Limit and Offset options below will be applied if your custom query doesn't include its own LIMIT/OFFSET clauses.
          </AlertDescription>
        </Alert>
      </TabsContent>
    </Tabs>
  );
};

export default QueryTabs;