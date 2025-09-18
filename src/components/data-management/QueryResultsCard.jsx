import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';

const QueryResultsCard = ({ selectedTable, queryResults }) => {
  if (!queryResults) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Query Results: <span className="font-mono ml-2 text-primary">{selectedTable}</span></CardTitle>
        <CardDescription>Displaying first 10 rows from the table.</CardDescription>
      </CardHeader>
      <CardContent>
        {queryResults.length > 0 ? (
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
            <TableCaption>Showing {queryResults.length} rows.</TableCaption>
          </Table>
        ) : (
          <p className="text-muted-foreground">Query returned no results or table is empty.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryResultsCard;