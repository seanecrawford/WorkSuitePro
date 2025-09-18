import { useEffect, useCallback } from 'react';
import useSchemaFetcher from './useSchemaFetcher';
import useQueryRunner from './useQueryRunner';
import { useToast } from "@/components/ui/use-toast";

export default function useDataManagement() {
  const { toast } = useToast();
  const schemaManager = useSchemaFetcher();
  const queryRunner = useQueryRunner();

  // Effect to fetch table details when selectedTable changes (and not already loaded/loading)
  useEffect(() => {
    if (queryRunner.selectedTable) {
      const tableSchema = schemaManager.fullSchema?.[queryRunner.selectedTable];
      if (
        (!tableSchema || !tableSchema.columns?.length || tableSchema.error) && // Not loaded or error
        !tableSchema?.loadingColumns && // Not currently loading
        !schemaManager.loadingSchema // Overall schema not loading (prevents race conditions on initial load)
      ) {
        // console.log(`useDataManagement: selectedTable is ${queryRunner.selectedTable}, fetching details.`);
        schemaManager.fetchTableDetails(queryRunner.selectedTable);
      }
    }
  }, [queryRunner.selectedTable, schemaManager.fullSchema, schemaManager.loadingSchema, schemaManager.fetchTableDetails]);


  // Callback to handle table selection from UI, triggers query runner's selection and clears custom query
  const handleTableSelection = useCallback((tableName) => {
    queryRunner.setSelectedTable(tableName); // This now also clears customQuery and results via useQueryRunner's internal logic
  }, [queryRunner]);

  // Callback to handle query execution, uses query runner's executeQuery
  const handleQueryExecution = useCallback((customSql) => {
    // queryRunner.executeQuery will use its internal customQuery state if customSql is undefined
    // or the provided customSql if it's a string.
    queryRunner.executeQuery(customSql); 
  }, [queryRunner]);


  return {
    // Schema related
    tables: schemaManager.tables,
    fullSchema: schemaManager.fullSchema,
    loadingSchema: schemaManager.loadingSchema,
    loadingTables: schemaManager.loadingTables,
    schemaError: schemaManager.schemaError,
    fetchFullSchema: schemaManager.fetchFullSchemaData, // This is the refresh function
    fetchTableDetails: schemaManager.fetchTableDetails, // Expose if direct detail fetch is needed
    
    // Query related
    selectedTable: queryRunner.selectedTable,
    setSelectedTable: handleTableSelection, // Use the wrapped handler
    customQuery: queryRunner.customQuery,
    setCustomQuery: queryRunner.setCustomQuery,
    queryResults: queryRunner.queryResults,
    loadingQuery: queryRunner.loadingQuery,
    queryError: queryRunner.queryError,
    executeQuery: handleQueryExecution, // Use the wrapped handler
    applyPremadeReport: queryRunner.applyPremadeReport,
    
    // Filters (managed by queryRunner, but exposed at top level)
    filters: queryRunner.filters,
    setFilters: queryRunner.setFilters,

    // General utilities
    toast,
  };
}