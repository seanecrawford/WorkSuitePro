import { useState, useCallback, useEffect } from 'react';
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

export default function useSchemaFetcher() {
  const [tables, setTables] = useState([]); 
  const [fullSchema, setFullSchema] = useState({}); 
  const [loadingSchema, setLoadingSchema] = useState(false); 
  const [schemaError, setSchemaError] = useState(null); 
  const [loadingTables, setLoadingTables] = useState(false); 

  const { toast } = useToast();

  const fetchMinimalTablesList = useCallback(async () => {
    setLoadingTables(true);
    setSchemaError(null);
    try {
      // Ensure the RPC call is made without parameters if it's designed that way
      const { data, error: rpcError } = await supabase.rpc('get_all_table_names_excluding_system');
      const sanitizedRpcError = rpcError ? sanitizeError(rpcError) : null;
      if (sanitizedRpcError && sanitizedRpcError.message) throw sanitizedRpcError;
      
      const formattedTables = (data || [])
        .map(table => ({
          value: table.table_name, 
          label: table.table_name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      
      setTables(formattedTables);
      
      const initialSchema = {};
      formattedTables.forEach(table => {
        initialSchema[table.value] = { columns: [], error: null, loadingColumns: false };
      });
      setFullSchema(prev => ({ ...prev, ...initialSchema }));

    } catch (err) {
      const sanitizedErr = sanitizeError(err);
      console.error("Error fetching tables list:", sanitizedErr);
      setSchemaError(getErrorMessage(sanitizedErr));
      toast({ variant: "destructive", title: "Error Fetching Tables", description: `Failed to fetch tables list: ${getErrorMessage(sanitizedErr)}` });
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  }, [toast]);


  const fetchTableDetails = useCallback(async (tableName, isRefresh = false) => {
    if (!tableName) return;
    
    setFullSchema(prevSchema => ({
      ...prevSchema,
      [tableName]: { ...(prevSchema?.[tableName] || { columns: [], error: null }), loadingColumns: true, error: null }
    }));
    
    try {
      const { data, error: rpcError } = await supabase.rpc('get_table_columns', { p_table_name: tableName });
      const sanitizedRpcError = rpcError ? sanitizeError(rpcError) : null;
      if (sanitizedRpcError && sanitizedRpcError.message) throw sanitizedRpcError;

      setFullSchema(prevSchema => ({
        ...prevSchema,
        [tableName]: { ...(prevSchema?.[tableName] || {}), columns: data || [], error: null, loadingColumns: false }
      }));

      if (isRefresh) {
        toast({ title: "Table Refreshed", description: `Details for ${tableName} updated. Found ${data?.length || 0} columns.`});
      }

    } catch (err) {
      const sanitizedErr = sanitizeError(err);
      console.error(`Error fetching details for table ${tableName}:`, sanitizedErr);
      toast({ variant: "destructive", title: "Column Fetch Error", description: `Failed to fetch columns for ${tableName}: ${getErrorMessage(sanitizedErr)}` });
      
      setFullSchema(prevSchema => ({
        ...prevSchema,
        [tableName]: { ...(prevSchema?.[tableName] || {}), columns: prevSchema?.[tableName]?.columns || [], error: getErrorMessage(sanitizedErr), loadingColumns: false }
      }));
    }
  }, [toast]);

  const fetchFullSchemaData = useCallback(async (isRefresh = false) => {
    setLoadingSchema(true); 
    setSchemaError(null);
    if (isRefresh) {
      toast({ title: "Refreshing Schema", description: "Fetching latest database schema details..." });
    }
    
    let fetchedTableNamesData = [];
    try {
        // Ensure the RPC call is made without parameters
        const { data: tableNamesRpcData, error: tablesError } = await supabase.rpc('get_all_table_names_excluding_system');
        const sanitizedTablesError = tablesError ? sanitizeError(tablesError) : null;
        if (sanitizedTablesError && sanitizedTablesError.message) throw sanitizedTablesError;
        
        fetchedTableNamesData = tableNamesRpcData || [];

        const formattedTables = fetchedTableNamesData
            .map(table => ({ value: table.table_name, label: table.table_name }))
            .sort((a, b) => a.label.localeCompare(b.label));
        setTables(formattedTables);

        const initialSchema = {};
        formattedTables.forEach(table => {
            initialSchema[table.value] = { columns: [], error: null, loadingColumns: false };
        });
        setFullSchema(prev => ({ ...prev, ...initialSchema }));


        const sortedTableNames = formattedTables.map(t => t.value);

        for (const tableName of sortedTableNames) {
            const tableEntry = fullSchema[tableName]; 
            if (isRefresh || !tableEntry || !tableEntry.columns || tableEntry.columns.length === 0 || tableEntry.error) {
                 await fetchTableDetails(tableName, false); 
            }
        }

        if (isRefresh) {
            toast({ title: "Schema Refreshed", description: `Database schema details updated. ${formattedTables.length} tables found.` });
        }

    } catch (err) {
        const sanitizedErr = sanitizeError(err);
        console.error("Error in fetchFullSchemaData:", sanitizedErr);
        setSchemaError(getErrorMessage(sanitizedErr)); 
        toast({ variant: "destructive", title: "Schema Load Error", description: `Failed during full schema fetch: ${getErrorMessage(sanitizedErr)}` });
    } finally {
        setLoadingSchema(false);
    }
  }, [toast, fetchTableDetails, fullSchema]); 

  const refreshSchema = useCallback(() => {
     fetchFullSchemaData(true); 
  }, [fetchFullSchemaData]);
  
  useEffect(() => {
    if (tables.length === 0 && !loadingTables && !loadingSchema && !schemaError) {
        fetchFullSchemaData(false); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return {
    tables, 
    fullSchema,
    loadingSchema,
    schemaError,
    loadingTables, 
    fetchMinimalTablesList, 
    fetchTableDetails,
    fetchFullSchemaData: refreshSchema, 
  };
}