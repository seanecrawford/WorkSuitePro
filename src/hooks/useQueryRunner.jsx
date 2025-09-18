import React, { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { 
  sanitizeError, 
  getErrorMessage, 
  buildFilterQuery,
  executeSupabaseQuery
} from '@/lib/queryUtils';

export default function useQueryRunner() {
  const [selectedTable, setSelectedTableInternal] = useState('');
  const [queryResults, setQueryResults] = useState(null); 
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [queryError, setQueryError] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [filters, setFilters] = useState({}); 

  const { toast } = useToast();

  const executeQuery = useCallback(async (queryOptions) => {
    const { 
      type = 'filters', 
      query: customSqlInput, 
      filters: queryFilters, 
      limit = 100, 
      offset = 0, 
      orderBy, 
      orderDirection,
      table: tableFromOptions
    } = queryOptions || {};
    
    let finalQueryToRun = '';
    let isCustomSql = false;
    const currentTable = tableFromOptions || selectedTable;

    if (type === 'customSql' && customSqlInput) {
      finalQueryToRun = customSqlInput;
      isCustomSql = true;
    } else if (type === 'filters' && currentTable) {
      finalQueryToRun = buildFilterQuery(currentTable, queryFilters, limit, offset, orderBy, orderDirection);
    } else if (currentTable) { 
      finalQueryToRun = `SELECT * FROM public."${currentTable}" LIMIT ${limit} OFFSET ${offset}`;
    }

    if (!finalQueryToRun) {
      setLoadingQuery(false);
      return;
    }

    setLoadingQuery(true);
    setQueryError(null);
    setQueryResults(null); 

    try {
      const { data: rpcData, error: rpcError } = await executeSupabaseQuery(finalQueryToRun);
      
      const sanitizedRpcError = rpcError ? sanitizeError(rpcError) : null;

      if (sanitizedRpcError && (sanitizedRpcError.message || sanitizedRpcError.error)) {
        const errorMessage = getErrorMessage(sanitizedRpcError.error || sanitizedRpcError);
        throw new Error(errorMessage);
      }
      
      if (rpcData && rpcData.error) {
        throw new Error(`SQL Error: ${rpcData.error} (Code: ${rpcData.sqlstate})`);
      }

      setQueryResults(rpcData || []); 
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error("Error executing query:", err);
      setQueryError(errorMessage);
      toast({ variant: "destructive", title: "Query Error", description: `Failed to execute query: ${errorMessage}` });
      setQueryResults([]); 
    } finally {
      setLoadingQuery(false);
    }
  }, [selectedTable, toast]);

  const handleSetSelectedTable = useCallback((tableName) => {
    setSelectedTableInternal(tableName); 
    setCustomQuery(''); 
    setQueryResults(null); 
    setQueryError(null); 
    setFilters({}); 
    if (tableName) {
      executeQuery({ type: 'filters', limit: 100, offset: 0, table: tableName });
    }
  }, [executeQuery]);

  const applyPremadeReport = useCallback((report) => {
    toast({
      title: "Report Selected",
      description: `Applying report: "${report.name}".`,
    });
    
    let queryForReport = '';
    let tableForReport = selectedTable; 

    if (report.id === 'financial_summary') {
      tableForReport = 'financialperformance'; 
      queryForReport = 'SELECT * FROM public."financialperformance" ORDER BY period_end_date DESC LIMIT 20;';
    } else if (report.id === 'project_status') {
      tableForReport = 'projects'; 
      queryForReport = 'SELECT projectname, status, startdate, enddate, priority FROM public."projects" WHERE status != \'Completed\' ORDER BY startdate DESC;';
    }
    
    if (tableForReport && tableForReport !== selectedTable) {
      handleSetSelectedTable(tableForReport); 
    }
    setCustomQuery(queryForReport); 
    executeQuery({ type: 'customSql', query: queryForReport, table: tableForReport });
    
  }, [toast, selectedTable, handleSetSelectedTable, executeQuery]);

  return {
    selectedTable,
    setSelectedTable: handleSetSelectedTable,
    customQuery,
    setCustomQuery,
    queryResults,
    loadingQuery,
    queryError,
    executeQuery,
    applyPremadeReport,
    filters, 
    setFilters
  };
}