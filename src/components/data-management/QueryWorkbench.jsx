import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DatabaseZap, Loader2, LayoutList as ListCollapse, AlertTriangle } from 'lucide-react';
import { formatColumnType } from '@/hooks/useDataManagement';

const QueryWorkbench = ({
  tables,
  selectedTable,
  columns,
  queryResults,
  loadingTables,
  loadingColumns,
  loadingQuery,
  error, // General error from the hook
  fetchTableDetails,
  executeQuery,
}) => {

  const handleTableSelect = (tableName) => {
    fetchTableDetails(tableName);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Query Workbench</CardTitle>
        <CardDescription>
          Select a table to view its structure and query its data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Selector Section */}
        <div>
          <label htmlFor="table-select-workbench" className="block text-sm font-medium text-muted-foreground mb-1">Select Table</label>
          {loadingTables ? (
            <Skeleton className="h-10 w-full md:w-1/2 lg:w-1/3" />
          ) : (
            <Select onValueChange={handleTableSelect} value={selectedTable || ''} disabled={tables.length === 0 || loadingTables}>
              <SelectTrigger id="table-select-workbench" className="w-full md:w-1/2 lg:w-1/3">
                <SelectValue placeholder="Choose a table..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.value} value={table.value}>
                    {table.label}
                  </SelectItem>
                ))}
                {tables.length === 0 && !loadingTables && <p className="p-2 text-sm text-muted-foreground">No tables found.</p>}
              </SelectContent>
            </Select>
          )}
        </div>

        {error && !selectedTable && ( // Show general error if no table is selected yet
          <div className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        {/* Table Structure Section - only show if a table is selected or loadingColumns is true */}
        {(selectedTable || loadingColumns) && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
              <ListCollapse className="mr-2 h-5 w-5 text-sky-400" /> 
              Structure: {selectedTable && <span className="font-mono ml-2 text-primary">{selectedTable}</span>}
            </h3>
            {loadingColumns ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : columns.length > 0 ? (
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Nullable</TableHead>
                      <TableHead>Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columns.map((col) => (
                      <TableRow key={col.column_name}>
                        <TableCell className="font-medium">{col.column_name}</TableCell>
                        <TableCell>{formatColumnType(col)}</TableCell>
                        <TableCell>{col.is_nullable}</TableCell>
                        <TableCell className="font-mono text-xs">{col.column_default || 'NULL'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : selectedTable && !error ? ( // Only show if no columns AND no specific error for this table
              <p className="text-muted-foreground">No column information available or table is empty.</p>
            ) : null}
            {error && selectedTable && <p className="text-destructive mt-2">{error}</p>} 
          </div>
        )}

        {/* Query Execution Button */}
        {selectedTable && !loadingColumns && (
          <div className="flex justify-end mt-4">
            <Button onClick={executeQuery} disabled={!selectedTable || loadingQuery || loadingColumns}>
              {loadingQuery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseZap className="mr-2 h-4 w-4" />}
              View Top 10 Rows
            </Button>
          </div>
        )}

        {/* Query Results Section */}
        {queryResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Query Results</h3>
            {queryResults.length > 0 ? (
               <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(queryResults[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResults.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <TableCell key={`${key}-${cellIndex}`} className="max-w-xs truncate" title={String(value)}>
                            {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>Showing {queryResults.length} rows from {selectedTable}.</TableCaption>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">Query returned no results.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryWorkbench;