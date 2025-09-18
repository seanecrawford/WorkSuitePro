import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have this shadcn component
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have this
import { Table2, Search, Eye, Loader2, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // For schema preview
import { useToast } from '@/components/ui/use-toast';

const TableItem = ({ table, isSelected, onSelectTable, onPreviewSchema }) => {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const { toast } = useToast();

  const handlePreview = async () => {
    if (previewData || previewLoading) return; // Don't re-fetch if already loaded or loading

    setPreviewLoading(true);
    setPreviewError(null);
    try {
      // Assuming table.name is the actual table name
      const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: table.name });
      if (error) throw error;
      setPreviewData(data);
    } catch (err) {
      console.error("Error fetching schema preview:", err);
      setPreviewError(err.message || "Failed to load preview.");
      toast({ title: "Preview Error", description: `Could not load preview for ${table.name}.`, variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-3 bg-card hover:bg-accent/60 rounded-lg border border-border transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          id={`table-${table.name}`}
          checked={isSelected}
          onCheckedChange={() => onSelectTable(table.name)}
          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <label htmlFor={`table-${table.name}`} className="text-sm font-medium text-foreground cursor-pointer">
          {table.name} <span className="text-xs text-muted-foreground">({table.schema || 'public'})</span>
        </label>
      </div>
      <Popover onOpenChange={(open) => open && handlePreview()}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Eye className="h-4 w-4 mr-1" /> Preview
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-popover border-border shadow-xl p-0">
          <div className="p-4 border-b border-border">
            <h4 className="font-semibold text-popover-foreground">Schema: {table.name}</h4>
          </div>
          <ScrollArea className="h-[200px] p-4">
            {previewLoading && <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="ml-2">Loading...</span></div>}
            {previewError && <div className="text-destructive text-sm p-2">{previewError}</div>}
            {previewData && previewData.length > 0 && (
              <ul className="space-y-1 text-xs">
                {previewData.map(col => (
                  <li key={col.column_name} className="flex justify-between">
                    <span className="text-popover-foreground">{col.column_name}</span>
                    <span className="text-muted-foreground">{col.data_type}</span>
                  </li>
                ))}
              </ul>
            )}
            {previewData && previewData.length === 0 && <p className="text-muted-foreground text-sm">No columns found or table is empty.</p>}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
};

const TableSelectionStep = ({ formData, updateFormData, availableTables, loadingTables, fetchTablesForSource }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectTable = (tableName) => {
    const newSelectedTables = formData.selectedTables.includes(tableName)
      ? formData.selectedTables.filter(t => t !== tableName)
      : [...formData.selectedTables, tableName];
    updateFormData({ selectedTables: newSelectedTables });
  };

  const filteredTables = availableTables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Select Tables for Mapping</h2>
      <p className="text-muted-foreground">
        Choose the tables from <strong className="text-primary">{formData.sourceName}</strong> that you want to integrate with Work Suite Pro.
        You can preview the schema of each table.
      </p>

      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border focus:border-primary"
          />
        </div>
        <Button variant="outline" onClick={fetchTablesForSource} disabled={loadingTables} className="border-primary text-primary hover:bg-primary/10">
          {loadingTables ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Tables
        </Button>
      </div>

      {loadingTables && (
        <div className="flex flex-col items-center justify-center py-10 bg-card/50 rounded-lg">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Fetching available tables...</p>
        </div>
      )}

      {!loadingTables && availableTables.length === 0 && (
         <Card className="p-6 text-center bg-card/50 border-border">
            <Info className="mx-auto h-12 w-12 text-muted-foreground/70 mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No Tables Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
                Could not find any tables in the connected data source, or an error occurred. Try refreshing.
            </p>
        </Card>
      )}

      {!loadingTables && availableTables.length > 0 && filteredTables.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No tables match your search criteria.</p>
      )}

      {!loadingTables && filteredTables.length > 0 && (
        <ScrollArea className="h-[300px] border border-border rounded-lg p-1 bg-background/30">
          <div className="space-y-2 p-3">
            {filteredTables.map(table => (
              <TableItem
                key={table.name}
                table={table}
                isSelected={formData.selectedTables.includes(table.name)}
                onSelectTable={handleSelectTable}
              />
            ))}
          </div>
        </ScrollArea>
      )}
      
      {formData.selectedTables.length > 0 && (
        <p className="text-sm text-primary font-medium">
          {formData.selectedTables.length} table(s) selected.
        </p>
      )}
    </div>
  );
};

export default TableSelectionStep;