import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutList as ListCollapse, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { formatColumnType } from '@/lib/utils';

const TableStructureDisplay = ({
  selectedTable,
  columns = [], 
  loadingColumns,
  error, // This error is specific to loading columns for the selectedTable
}) => {
  // Determine if there's an error specifically for loading these columns
  const isColumnLoadingError = error && selectedTable && !loadingColumns && (!columns || columns.length === 0);

  if (!selectedTable && !loadingColumns) { // Don't render if no table selected and not loading
    return null;
  }

  return (
    <div className="mt-2 mb-2">
      <h4 className="text-sm font-semibold text-foreground mb-1.5 flex items-center">
        <ListCollapse className="mr-1.5 h-4 w-4 text-sky-400" />
        Structure: {selectedTable && <span className="font-mono ml-1.5 text-primary text-xs">{selectedTable}</span>}
      </h4>
      {loadingColumns ? (
        <div className="space-y-1.5">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-7 w-full bg-slate-700/50" />)}
        </div>
      ) : columns && columns.length > 0 ? (
        <div className="overflow-x-auto border border-slate-700 rounded-md max-h-60 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
          <Table className="text-xs">
            <TableHeader className="sticky top-0 bg-slate-700/80 backdrop-blur-sm">
              <TableRow>
                <TableHead className="h-8 px-2 py-1 text-slate-300">Column</TableHead>
                <TableHead className="h-8 px-2 py-1 text-slate-300">Type</TableHead>
                <TableHead className="h-8 px-2 py-1 text-slate-300">Nullable</TableHead>
                <TableHead className="h-8 px-2 py-1 text-slate-300">Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((col) => (
                <TableRow key={col.column_name} className="hover:bg-slate-700/30">
                  <TableCell className="font-medium px-2 py-1.5 text-slate-200">{col.column_name}</TableCell>
                  <TableCell className="px-2 py-1.5 text-slate-300">{formatColumnType(col)}</TableCell>
                  <TableCell className="px-2 py-1.5 text-slate-300">{col.is_nullable}</TableCell>
                  <TableCell className="font-mono text-xs px-2 py-1.5 text-slate-400">{col.column_default || 'NULL'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : selectedTable && !isColumnLoadingError ? ( // If table selected, no error, but no columns
        <p className="text-muted-foreground text-xs px-1 py-2">No column information available or table is empty.</p>
      ) : null}
      {isColumnLoadingError && (
        <p className="text-red-400 mt-1.5 text-xs flex items-center">
            <AlertTriangle className="h-3.5 w-3.5 mr-1"/> 
            Error fetching columns for {selectedTable}: {typeof error === 'string' ? error : error?.message || 'Unknown error'}
        </p>
      )}
    </div>
  );
};

export default TableStructureDisplay;