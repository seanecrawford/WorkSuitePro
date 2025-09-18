import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Loader2, Database, AlertTriangle } from 'lucide-react';

const TableQueryControls = ({
  tables,
  selectedTable,
  loadingTables,
  loadingQuery,
  loadingColumns, // Added this prop
  error, // Error related to table/column loading
  onTableSelect,
  onExecuteQuery,
  customQuery,
  setCustomQuery
}) => {
  const handleExecute = () => {
    // onExecuteQuery will use the customQuery from its parent's state (useDataManagement)
    // or run default if customQuery is empty.
    onExecuteQuery(); 
  };

  return (
    <div className="space-y-3 border-b border-slate-700 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="table-select" className="text-xs flex items-center mb-1">
            <Database className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> Select Table
          </Label>
          <Select
            value={selectedTable || ''} // Ensure value is controlled, default to empty string if null/undefined
            onValueChange={onTableSelect}
            disabled={loadingTables || loadingQuery || loadingColumns} // Disable if columns are loading too
          >
            <SelectTrigger id="table-select" className="text-xs h-9">
              <SelectValue placeholder={loadingTables ? "Loading tables..." : "Select a table"} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
              {loadingTables && <SelectItem value="loading" disabled>Loading...</SelectItem>}
              {!loadingTables && tables.map((table) => (
                <SelectItem key={table.value} value={table.value} className="text-xs">
                  {table.label}
                </SelectItem>
              ))}
              {!loadingTables && tables.length === 0 && <SelectItem value="no-tables" disabled>No tables found</SelectItem>}
            </SelectContent>
          </Select>
          {/* Display general table loading error if no table is selected yet */}
          {error && !selectedTable && !loadingTables && <p className="text-red-400 text-xs mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>{typeof error === 'string' ? error : error.message}</p>}
        </div>
        <div className="flex items-end"> 
          <Button
            onClick={handleExecute}
            disabled={loadingQuery || loadingColumns || (!selectedTable && !customQuery)} // Disable if columns loading or no selection/custom query
            className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 w-full md:w-auto"
            title={customQuery ? "Execute custom SQL query" : `Fetch first 10 rows from ${selectedTable || 'selected table'}`}
          >
            {loadingQuery ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-1.5 h-4 w-4" />
            )}
            {customQuery ? 'Run SQL' : 'Run Default Query'}
          </Button>
        </div>
      </div>
      
      <div>
        <Label htmlFor="custom-query-input" className="text-xs mb-1">Custom SQL Query (Optional - uses `execute_dynamic_sql` RPC)</Label>
        <Textarea
          id="custom-query-input"
          placeholder="e.g., SELECT * FROM public.your_table WHERE status = 'active';"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          className="bg-background text-xs font-mono h-24"
          disabled={loadingQuery || loadingColumns} // Disable if columns are loading
        />
        <p className="text-2xs text-muted-foreground mt-1">
            If empty, a default query (SELECT * ... LIMIT 10) for the selected table will be run.
            Ensure your `execute_dynamic_sql` function is configured in Supabase for custom queries.
        </p>
      </div>

      {/* Display column loading status or error specific to the selected table */}
      {loadingColumns && selectedTable && (
        <div className="text-xs text-muted-foreground flex items-center">
          <Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading columns for {selectedTable}...
        </div>
      )}
      {error && selectedTable && !loadingColumns && ( // Show error only if not loading columns
         <div className="text-xs text-red-400 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" /> Error loading columns for {selectedTable}: {typeof error === 'string' ? error : error.message}
        </div>
      )}
    </div>
  );
};

export default TableQueryControls;