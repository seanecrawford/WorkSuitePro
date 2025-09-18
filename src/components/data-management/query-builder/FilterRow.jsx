import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FilterRow = ({ filter, onUpdate, onRemove, availableColumns = [] }) => {
  const [column, setColumn] = useState(filter.column || '');
  const [operator, setOperator] = useState(filter.operator || 'equals');
  const [value, setValue] = useState(filter.value || '');

  useEffect(() => {
    setColumn(filter.column || '');
    setOperator(filter.operator || 'equals');
    setValue(filter.value || '');
  }, [filter]);

  const handleUpdate = () => {
    onUpdate({ ...filter, column, operator, value });
  };

  const operators = [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '!=' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'greater_than_or_equals', label: '>=' },
    { value: 'less_than_or_equals', label: '<=' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' },
  ];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
    >
      <Select value={column} onValueChange={(val) => { setColumn(val); onUpdate({ ...filter, column: val, operator, value }); }}>
        <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-slate-200">
          <SelectValue placeholder="Select column" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
          {availableColumns.map(col => (
            <SelectItem key={col.name} value={col.name} className="hover:bg-slate-700 focus:bg-slate-700">
              {col.name} ({col.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={operator} onValueChange={(val) => { setOperator(val); onUpdate({ ...filter, column, operator: val, value }); }}>
        <SelectTrigger className="w-full sm:w-[150px] bg-slate-700 border-slate-600 text-slate-200">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
          {operators.map(op => (
            <SelectItem key={op.value} value={op.value} className="hover:bg-slate-700 focus:bg-slate-700">{op.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {operator !== 'is_null' && operator !== 'is_not_null' && (
        <Input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleUpdate}
          className="flex-grow bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400"
        />
      )}
      <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default FilterRow;