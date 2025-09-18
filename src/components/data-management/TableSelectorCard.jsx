import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DatabaseZap, Loader2 } from 'lucide-react';

const TableSelectorCard = ({
  tables,
  selectedTable,
  onTableSelect,
  loadingTables,
  onExecuteQuery,
  loadingQuery,
  loadingColumns,
  disabledExecute
}) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Query Builder</CardTitle>
        <CardDescription>
          Select a table to view its structure and query its data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="table-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Table</label>
          {loadingTables ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={onTableSelect} value={selectedTable} disabled={tables.length === 0 || loadingTables}>
              <SelectTrigger id="table-select" className="w-full md:w-1/2 lg:w-1/3">
                <SelectValue placeholder="Choose a table..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.value} value={table.value}>
                    {table.label}
                  </SelectItem>
                ))}
                {tables.length === 0 && !loadingTables && <p className="p-2 text-sm text-muted-foreground">No tables found or accessible.</p>}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onExecuteQuery} disabled={disabledExecute || !selectedTable || loadingQuery || loadingColumns}>
            {loadingQuery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseZap className="mr-2 h-4 w-4" />}
            Execute Query (Top 10 rows)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TableSelectorCard;