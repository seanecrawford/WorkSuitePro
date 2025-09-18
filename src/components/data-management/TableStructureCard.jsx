import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutList as ListCollapse } from 'lucide-react';
import { formatColumnType } from '@/hooks/useDataManagement';

const TableStructureCard = ({ selectedTable, columns, loadingColumns }) => {
  if (!selectedTable && !loadingColumns) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ListCollapse className="mr-2 h-5 w-5" /> 
          Table Structure: 
          {selectedTable && <span className="font-mono ml-2 text-primary">{selectedTable}</span>}
        </CardTitle>
        {selectedTable && <CardDescription>Detailed column information for the selected table.</CardDescription>}
      </CardHeader>
      <CardContent>
        {loadingColumns ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : columns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Nullable</TableHead>
                <TableHead>Default Value</TableHead>
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
        ) : selectedTable ? (
          <p className="text-muted-foreground">No column information available for this table or table is empty.</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TableStructureCard;