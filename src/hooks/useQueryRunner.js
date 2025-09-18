import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const sanitizeError = (error) => {
  if (!error) return { message: 'Unknown error', details: '', hint: '', code: '' };
  if (typeof error === 'string') return { message: error, details: '', hint: '', code: '' };
  return {
    message: error.message || 'An unexpected error occurred.',
    details: error.details || '',
    hint: error.hint || '',
    code: error.code || '',
  };
};

const getErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  return error.message || 'An unexpected error occurred.';
};

// Function to clean up SQL query string: remove trailing semicolons and collapse multiple semicolons
const cleanupSqlString = (sql) => {
  if (!sql || typeof sql !== 'string') return '';
  // Replace multiple semicolons (possibly with whitespace between them) with a single one
  let cleaned = sql.replace(/;\s*;+/g, ';');
  // Remove any trailing semicolon (and whitespace before it)
  cleaned = cleaned.replace(/;\s*$/, '');
  return cleaned.trim();
};


export default function useQueryRunner() {
  const [selectedTable, setSelectedTableInternal] = useState(''); // Renamed internal state setter
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
      table: tableFromOptions // Table can be passed in options, e.g., from filter builder OR from setSelectedTable
    } = queryOptions || {};
    
    let finalQueryToRun = '';
    let isCustomSql = false;
    const currentTable = tableFromOptions || selectedTable; // Use tableFromOptions if provided, else hook's state

    if (type === 'customSql' && customSqlInput) {
      finalQueryToRun = customSqlInput;
      isCustomSql = true;
    } else if (type === 'filters' && currentTable) {
      let baseQuery = `SELECT * FROM public."${currentTable}"`;
      const whereClauses = [];
      
      if (queryFilters && queryFilters.length > 0) {
        queryFilters.forEach(filter => {
          if (filter.column && filter.operator) {
            let value = filter.value;
            if (typeof value === 'string') {
              value = value.replace(/'/g, "''"); 
            }
            switch (filter.operator) {
              case 'equals': whereClauses.push(`"${filter.column}" = '${value}'`); break;
              case 'not_equals': whereClauses.push(`"${filter.column}" != '${value}'`); break;
              case 'greater_than': whereClauses.push(`"${filter.column}" > '${value}'`); break;
              case 'less_than': whereClauses.push(`"${filter.column}" < '${value}'`); break;
              case 'greater_than_or_equals': whereClauses.push(`"${filter.column}" >= '${value}'`); break;
              case 'less_than_or_equals': whereClauses.push(`"${filter.column}" <= '${value}'`); break;
              case 'contains': whereClauses.push(`"${filter.column}" ILIKE '%${value}%'`); break;
              case 'starts_with': whereClauses.push(`"${filter.column}" ILIKE '${value}%'`); break;
              case 'ends_with': whereClauses.push(`"${filter.column}" ILIKE '%${value}'`); break;
              case 'is_null': whereClauses.push(`"${filter.column}" IS NULL`); break;
              case 'is_not_null': whereClauses.push(`"${filter.column}" IS NOT NULL`); break;
              default: break;
            }
          }
        });
      }
      if (whereClauses.length > 0) {
        baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      if (orderBy && orderBy !== '--none--') {
        baseQuery += ` ORDER BY "${orderBy}" ${orderDirection === 'desc' ? 'DESC' : 'ASC'}`;
      }
      baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;
      finalQueryToRun = baseQuery;
    } else if (currentTable) { 
        finalQueryToRun = `SELECT * FROM public."${currentTable}" LIMIT ${limit} OFFSET ${offset}`;
    }

    const cleanedFinalQuery = cleanupSqlString(finalQueryToRun);

    if (!cleanedFinalQuery) {
      setLoadingQuery(false);
      return;
    }

    setLoadingQuery(true);
    setQueryError(null);
    setQueryResults(null); 

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('execute_dynamic_sql', { sql_query: cleanedFinalQuery });
      
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
    executeQuery({ type: 'customSql', query: queryForReport, table: tableForReport }); // Ensure table is passed if needed
    
  }, [toast, selectedTable, handleSetSelectedTable, executeQuery]); // Removed setCustomQuery from deps as it's handled by handleSetSelectedTable

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