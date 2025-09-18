import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, Database, Search, ArrowDownUp, ArrowDown, ArrowUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const QueryResultsDisplay = ({
  queryResults: initialQueryResults, // Renamed to avoid conflict with internal state
  loadingQuery, // Renamed from loading for clarity
  selectedTable,
  error, // This is queryError
  columnsMeta, // Optional: metadata about columns for advanced features
}) => {
  const [filters, setFilters] = useState({}); 
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' }); 

  const handleFilterChange = (columnName, value) => {
    setFilters(prev => ({ ...prev, [columnName]: value }));
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      // Optional: third click could clear sort or cycle back
      direction = 'ascending'; 
    }
    setSortConfig({ key, direction });
  };

  const processedResults = useMemo(() => {
    if (!initialQueryResults) return null; // Distinguish between no query run and empty results
    if (!Array.isArray(initialQueryResults)) return []; // Should always be an array if not null

    let results = [...initialQueryResults];

    const activeFilters = Object.entries(filters).filter(([_, value]) => value && String(value).trim() !== '');
    if (activeFilters.length > 0) {
      results = results.filter(row => {
        return activeFilters.every(([columnName, filterValue]) => {
          const rowValue = row[columnName];
          if (rowValue === null || typeof rowValue === 'undefined') return false;
          return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
        });
      });
    }

    if (sortConfig.key) {
      results.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === null || typeof valA === 'undefined') return sortConfig.direction === 'ascending' ? 1 : -1; // Nulls last when ascending
        if (valB === null || typeof valB === 'undefined') return sortConfig.direction === 'ascending' ? -1 : 1; // Nulls last when ascending
        
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        // Fallback for other types (dates, booleans as strings)
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortConfig.direction === 'ascending' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }
    return results;
  }, [initialQueryResults, filters, sortConfig]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowDownUp className="h-3.5 w-3.5 ml-1.5 text-slate-500 group-hover:text-slate-300 transition-colors" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="h-3.5 w-3.5 ml-1.5 text-sky-400" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 ml-1.5 text-sky-400" />;
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const renderStateMessage = (IconComponent, title, message, iconColorClass = "text-slate-500") => (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-800/30 rounded-lg m-4"
    >
      <IconComponent className={`mb-4 h-16 w-16 ${iconColorClass}`} strokeWidth={1.5} />
      <p className="text-xl font-semibold text-slate-100 mb-1">{title}</p>
      <p className="text-sm text-slate-400 max-w-md">{message}</p>
    </motion.div>
  );


  const renderContent = () => {
    if (loadingQuery) {
      return renderStateMessage(Loader2, "Fetching Data...", "Please wait while we retrieve the results.", "text-sky-400 animate-spin");
    }

    if (error) { // queryError
      return renderStateMessage(AlertTriangle, "Query Error", typeof error === 'string' ? error : error.message || 'An unexpected error occurred while fetching data.', "text-red-400");
    }
    
    if (processedResults === null) { // Initial state, no query run yet
        return renderStateMessage(Info, "No Query Run", "Select a table or enter a custom query and click \"Run\" to see results.", "text-sky-400");
    }

    if (processedResults.length === 0) { // Query run, but no results
      return renderStateMessage(Search, "No Results Found", Object.values(filters).some(f => f) ? "Your filter criteria returned no results. Try adjusting your filters." : `The query for ${selectedTable ? <span className="font-mono text-sky-300">{selectedTable}</span> : 'the custom query'} returned no results.`, "text-amber-400");
    }
    
    const columnKeys = Object.keys(processedResults[0] || {});

    return (
      <div className="overflow-auto h-full scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        <Table className="min-w-full text-xs">
          <TableHeader className="sticky top-0 bg-slate-800/95 backdrop-blur-sm z-10">
            <TableRow>
              {columnKeys.map(key => (
                <TableHead 
                  key={key} 
                  className="text-xs uppercase tracking-wider text-slate-300 px-2.5 py-2 whitespace-nowrap group cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => requestSort(key)}
                >
                  <div className="flex items-center">
                    {key}
                    {getSortIcon(key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="bg-slate-800/80">
              {columnKeys.map(key => (
                <TableHead key={`filter-${key}`} className="p-1">
                  <Input
                    type="text"
                    placeholder={`Filter ${key}...`}
                    value={filters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="h-7 text-xs bg-slate-700/60 border-slate-600 focus:bg-slate-700 focus:border-sky-500 placeholder-slate-400"
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedResults.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-slate-700/40 transition-colors duration-150 even:bg-slate-800/20">
                {Object.entries(row).map(([key, value], cellIndex) => (
                  <TableCell 
                    key={`${key}-${cellIndex}`} 
                    className="max-w-[200px] truncate px-2.5 py-2 text-slate-200 border-b border-slate-700/60" 
                    title={String(value)}
                  >
                    {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {processedResults.length > 0 && (
            <TableCaption className="py-2.5 text-xs text-slate-400">
              Showing {processedResults.length} row{processedResults.length === 1 ? '' : 's'}
              {initialQueryResults && initialQueryResults.length !== processedResults.length ? ` (filtered from ${initialQueryResults.length})` : ''}
              {selectedTable && ` from ${selectedTable}`}.
            </TableCaption>
          )}
        </Table>
      </div>
    );
  };
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm h-full flex flex-col shadow-xl border-slate-700/60 overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-slate-700/60 flex-shrink-0">
        <CardTitle className="text-base font-semibold text-slate-100 flex items-center">
          <Database className="w-4 h-4 mr-2 text-sky-400"/>
          Query Results
          {selectedTable && !loadingQuery && !error && processedResults && processedResults.length > 0 && (
            <span className="text-xs font-normal text-slate-400 ml-1.5">for <span className="font-mono text-sky-300">{selectedTable}</span></span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default QueryResultsDisplay;