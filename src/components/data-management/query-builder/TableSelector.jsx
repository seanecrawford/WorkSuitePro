import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TableSelector = ({ tables, selectedTable, fetchTableDetails }) => {
  return (
    <div className="mb-4">
      <Label htmlFor="table-select" className="text-slate-300 mb-1 block">Select Table</Label>
      <Select onValueChange={(value) => fetchTableDetails(value)} value={selectedTable || ""}>
        <SelectTrigger id="table-select" className="w-full bg-slate-700 border-slate-600 text-slate-200">
          <SelectValue placeholder="Select a table..." />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
          {tables && tables.length > 0 ? (
            tables.map(table => (
              <SelectItem key={table.value} value={table.value} className="hover:bg-slate-700 focus:bg-slate-700">
                {table.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled>Loading tables...</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TableSelector;