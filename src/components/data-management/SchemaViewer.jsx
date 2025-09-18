import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw, AlertTriangle, DatabaseZap, Table2, Info } from 'lucide-react';
import TableStructureDisplay from './TableStructureDisplay';
import { motion } from 'framer-motion';

const SchemaViewer = ({ schema, loading, onRefresh, error, fetchTableDetails }) => {

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const renderStateMessage = (IconComponent, title, message, iconColorClass = "text-slate-500", showRefresh = false) => (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-800/30 rounded-lg"
    >
      <IconComponent className={`mb-3 h-12 w-12 ${iconColorClass}`} strokeWidth={1.5} />
      <p className="text-lg font-semibold text-slate-100 mb-1">{title}</p>
      <p className="text-sm text-slate-400 max-w-md">{message}</p>
      {showRefresh && typeof onRefresh === 'function' && (
        <Button variant="outline" onClick={onRefresh} className="mt-4 bg-sky-500/20 hover:bg-sky-500/30 border-sky-500 text-sky-300">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      )}
    </motion.div>
  );

  if (loading && (!schema || Object.keys(schema).length === 0)) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm min-h-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-100"><DatabaseZap className="mr-2 h-5 w-5 text-sky-400" /> Database Schema</CardTitle>
          <CardDescription className="text-slate-400">Loading schema details, please wait...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-slate-700/60 rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error && (!schema || Object.keys(schema).length === 0)) { 
    return (
      <Card className="bg-red-800/30 border border-red-700/50 min-h-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center text-red-300">
            <AlertTriangle className="mr-2 h-5 w-5" /> Schema Loading Error
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {renderStateMessage(
            AlertTriangle, 
            "Schema Error", 
            `Failed to load the database schema: ${getErrorMessage(error)}`,
            "text-red-400",
            true 
          )}
        </CardContent>
      </Card>
    );
  }
  
  const sortedTableNames = schema ? Object.keys(schema).sort((a, b) => a.localeCompare(b)) : [];

  if (sortedTableNames.length === 0 && !loading) {
     return (
      <Card className="bg-slate-800/50 backdrop-blur-sm min-h-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-100"><DatabaseZap className="mr-2 h-5 w-5 text-sky-400" /> Database Schema</CardTitle>
        </CardHeader>
        <CardContent>
           {renderStateMessage(
            Info,
            "No Schema Information",
            "No tables found in the schema or schema is empty. Try refreshing.",
            "text-sky-400",
            true
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-slate-800/80 backdrop-blur-md z-10 py-3.5 px-4 border-b border-slate-700/60">
        <div>
          <CardTitle className="flex items-center text-slate-100"><DatabaseZap className="mr-2 h-5 w-5 text-sky-400" /> Database Schema</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Click on a table name to view its structure.
            {loading && <Loader2 className="inline-block ml-2 h-3.5 w-3.5 animate-spin text-sky-300" />}
            {!loading && error && <span className="text-red-400 text-xs ml-2">(Error: {getErrorMessage(error)})</span>}
          </CardDescription>
        </div>
        {typeof onRefresh === 'function' && <Button variant="outline" onClick={onRefresh} size="sm" disabled={loading} className="bg-sky-500/20 hover:bg-sky-500/30 border-sky-500 text-sky-300">
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>}
      </CardHeader>
      <CardContent className="p-3 md:p-4 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        {sortedTableNames.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {sortedTableNames.map((tableName) => {
              const tableData = schema[tableName] || { columns: [], error: null, loadingColumns: false };
              return (
                <AccordionItem value={tableName} key={tableName} className="border-slate-700/70 mb-1.5 last:mb-0 rounded-md overflow-hidden bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <AccordionTrigger 
                    className="px-3 py-2.5 text-slate-200 hover:no-underline data-[state=open]:bg-slate-700/60 justify-between text-sm"
                    onOpenChange={(isOpen) => {
                      if (isOpen && !tableData.columns?.length && !tableData.loadingColumns && !tableData.error && typeof fetchTableDetails === 'function') {
                        fetchTableDetails(tableName);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <Table2 className="mr-2.5 h-4 w-4 text-sky-400 flex-shrink-0" />
                      <span className="font-medium">{tableName}</span>
                      {tableData.loadingColumns && <Loader2 className="ml-3 h-4 w-4 animate-spin text-slate-400" />}
                      {tableData.error && !tableData.loadingColumns && (
                        <AlertTriangle className="ml-3 h-4 w-4 text-amber-400" title={`Error fetching columns: ${getErrorMessage(tableData.error)}`} />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3 px-3 bg-slate-800/20 rounded-b-md">
                    <TableStructureDisplay 
                      selectedTable={tableName}
                      columns={tableData.columns || []}
                      loadingColumns={tableData.loadingColumns}
                      error={tableData.error}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <p className="text-slate-400 text-sm">No tables found in the schema.</p>
        )}
      </CardContent>
    </Card>
  );
};

const getErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  return error.message || 'An unexpected error occurred.';
};

export default SchemaViewer;