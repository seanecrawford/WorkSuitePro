import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const QueryOptions = ({
  limit,
  setLimit,
  offset,
  setOffset,
  orderBy,
  setOrderBy,
  orderDirection,
  setOrderDirection,
  availableColumns,
  selectedTable,
  activeTab
}) => {
  return (
    <>
      {activeTab === 'filters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orderBy" className="text-slate-300 mb-1 block">Order By</Label>
            <Select value={orderBy} onValueChange={setOrderBy} disabled={!selectedTable}>
              <SelectTrigger id="orderBy" className="w-full bg-slate-700 border-slate-600 text-slate-200">
                <SelectValue placeholder="Select column to order by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem value="--none--" className="hover:bg-slate-700 focus:bg-slate-700">None</SelectItem>
                {availableColumns.map(col => (
                  <SelectItem key={col.name} value={col.name} className="hover:bg-slate-700 focus:bg-slate-700">{col.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="orderDirection" className="text-slate-300 mb-1 block">Direction</Label>
            <Select value={orderDirection} onValueChange={setOrderDirection} disabled={!orderBy || orderBy === '--none--'}>
              <SelectTrigger id="orderDirection" className="w-full bg-slate-700 border-slate-600 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem value="asc" className="hover:bg-slate-700 focus:bg-slate-700">Ascending</SelectItem>
                <SelectItem value="desc" className="hover:bg-slate-700 focus:bg-slate-700">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="limit" className="text-slate-300 mb-1 block">Limit</Label>
          <Input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="bg-slate-700 border-slate-600 text-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="offset" className="text-slate-300 mb-1 block">Offset</Label>
          <Input
            id="offset"
            type="number"
            value={offset}
            onChange={(e) => setOffset(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="bg-slate-700 border-slate-600 text-slate-200"
          />
        </div>
      </div>
    </>
  );
};

export default QueryOptions;