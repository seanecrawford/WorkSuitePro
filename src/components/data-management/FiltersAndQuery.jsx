import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ChevronDown, ChevronUp, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

import HelpAccordion from '@/components/data-management/query-builder/HelpAccordion';
import TableSelector from '@/components/data-management/query-builder/TableSelector';
import QueryTabs from '@/components/data-management/query-builder/QueryTabs';
import QueryOptions from '@/components/data-management/query-builder/QueryOptions';
import { QueryHistoryPanel, SavedQueriesPanel, SaveQueryControls } from '@/components/data-management/query-builder/QueryPersistence';


const FiltersAndQuery = ({ 
  selectedTable, 
  columns, // Changed from tableStructure to align with DataManagementPage's direct prop
  executeQuery, // Changed from onRunQuery
  loadingQuery, // Changed from isLoading
  queryHistory = [],
  onLoadQueryFromHistory,
  onClearQueryHistory,
  onSaveQuery,
  savedQueries = [],
  onLoadSavedQuery,
  onDeleteSavedQuery,
  customQuery: parentCustomQuery,
  setCustomQuery: parentSetCustomQuery,
  tables, 
  fetchTableDetails, // This prop comes from DataManagementPage, maps to setSelectedTable there
  onApplyFilters, // Prop for applying filters (optional)
  loadingTables, // Added prop
  loadingColumns, // Added prop
  error // Added prop for schema/column loading errors
}) => {
  const [filters, setFilters] = useState([]);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [activeTab, setActiveTab] = useState('filters'); 
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSavedQueries, setShowSavedQueries] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState('');

  const { toast } = useToast();

  const availableColumns = columns || []; // Use passed columns prop

  useEffect(() => {
    setFilters([]);
    setOrderBy('');
    setOrderDirection('asc');
  }, [selectedTable]);

  const addFilter = () => {
    setFilters([...filters, { id: Date.now(), column: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (updatedFilter) => {
    setFilters(filters.map(f => f.id === updatedFilter.id ? updatedFilter : f));
  };

  const removeFilter = (id) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleRunQuery = () => {
    if (typeof executeQuery !== 'function') {
      toast({
        title: "Error",
        description: "Query execution function is not available.",
        variant: "destructive",
      });
      console.error("FiltersAndQuery: executeQuery prop is not a function.");
      return;
    }

    if (activeTab === 'filters') {
      executeQuery({ type: 'filters', filters, limit, offset, orderBy, orderDirection, table: selectedTable });
      if (onApplyFilters) onApplyFilters(filters);
    } else {
      if (!parentCustomQuery.trim()) {
        toast({
          title: "Empty Query",
          description: "Please enter a SQL query to run.",
          variant: "destructive",
        });
        return;
      }
      executeQuery({ type: 'customSql', query: parentCustomQuery, limit, offset });
    }
  };

  const handleSaveQuery = () => {
    if (!saveQueryName.trim()) {
      toast({ title: "Error", description: "Please enter a name for the saved query.", variant: "destructive" });
      return;
    }
    const queryToSave = activeTab === 'filters' 
      ? { type: 'filters', filters, limit, offset, orderBy, orderDirection, table: selectedTable }
      : { type: 'customSql', query: parentCustomQuery, table: selectedTable };
    
    if (typeof onSaveQuery === 'function') {
      onSaveQuery(saveQueryName, queryToSave);
      setSaveQueryName('');
      toast({ title: "Query Saved", description: `Query "${saveQueryName}" has been saved.`, variant: "default" });
    } else {
      toast({ title: "Error", description: "Save query functionality is not available.", variant: "destructive" });
    }
  };

  const handleLoadSavedQuery = (savedQuery) => {
    if (savedQuery.queryData.type === 'filters') {
      setActiveTab('filters');
      setFilters(savedQuery.queryData.filters || []);
      setLimit(savedQuery.queryData.limit || 100);
      setOffset(savedQuery.queryData.offset || 0);
      setOrderBy(savedQuery.queryData.orderBy || '');
      setOrderDirection(savedQuery.queryData.orderDirection || 'asc');
    } else {
      setActiveTab('customSql');
      parentSetCustomQuery(savedQuery.queryData.query || '');
      setFilters([]); 
    }
    if (fetchTableDetails && savedQuery.queryData.table && savedQuery.queryData.table !== selectedTable) {
        fetchTableDetails(savedQuery.queryData.table);
    }
    toast({ title: "Query Loaded", description: `Query "${savedQuery.name}" has been loaded.`, variant: "default" });
  };
  
  return (
    <Card className="bg-slate-900 border-slate-700/80 shadow-2xl">
      <CardHeader className="border-b border-slate-700/60">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-slate-100 flex items-center">
            <SlidersHorizontal className="h-5 w-5 mr-2.5 text-sky-400" />
            Query Builder & Controls
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)} className="text-slate-400 hover:text-sky-400 hover:bg-slate-700/50">
            {showHelp ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            How to use
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden px-6 pt-4"
          >
            <HelpAccordion />
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent className="pt-6 space-y-6">
        <TableSelector tables={tables} selectedTable={selectedTable} fetchTableDetails={fetchTableDetails} loadingTables={loadingTables} />
        
        <QueryTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filters={filters}
          addFilter={addFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
          availableColumns={availableColumns}
          selectedTable={selectedTable}
          parentCustomQuery={parentCustomQuery}
          parentSetCustomQuery={parentSetCustomQuery}
          loadingColumns={loadingColumns}
          error={error}
        />

        <QueryOptions 
          limit={limit}
          setLimit={setLimit}
          offset={offset}
          setOffset={setOffset}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          orderDirection={orderDirection}
          setOrderDirection={setOrderDirection}
          availableColumns={availableColumns}
          selectedTable={selectedTable}
          activeTab={activeTab}
          loadingColumns={loadingColumns}
        />

        <SaveQueryControls 
          saveQueryName={saveQueryName}
          setSaveQueryName={setSaveQueryName}
          handleSaveQuery={handleSaveQuery}
          disabled={loadingQuery}
        />
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-700/60 pt-4">
        <div className="flex gap-2">
          <Button onClick={() => setShowHistory(!showHistory)} variant="outline" size="sm" className="text-slate-300 hover:bg-slate-700/50" disabled={loadingQuery}>
            {showHistory ? 'Hide' : 'Show'} History
          </Button>
          <Button onClick={() => setShowSavedQueries(!showSavedQueries)} variant="outline" size="sm" className="text-slate-300 hover:bg-slate-700/50" disabled={loadingQuery}>
            {showSavedQueries ? 'Hide' : 'Show'} Saved Queries
          </Button>
        </div>
        <Button onClick={handleRunQuery} disabled={loadingQuery || (!selectedTable && activeTab === 'filters' && !parentCustomQuery)} className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold shadow-md hover:shadow-lg w-full sm:w-auto">
          {loadingQuery ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          {loadingQuery ? 'Running...' : 'Run Query'}
        </Button>
      </CardFooter>

      <QueryHistoryPanel 
        showHistory={showHistory}
        queryHistory={queryHistory}
        onLoadQueryFromHistory={typeof onLoadQueryFromHistory === 'function' ? onLoadQueryFromHistory : () => {}}
        onClearQueryHistory={typeof onClearQueryHistory === 'function' ? onClearQueryHistory : () => {}}
      />
      
      <SavedQueriesPanel 
        showSavedQueries={showSavedQueries}
        savedQueries={savedQueries}
        handleLoadSavedQuery={handleLoadSavedQuery}
        onDeleteSavedQuery={typeof onDeleteSavedQuery === 'function' ? onDeleteSavedQuery : () => {}}
      />
    </Card>
  );
};

export default FiltersAndQuery;