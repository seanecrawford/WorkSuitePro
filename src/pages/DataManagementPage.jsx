import React from 'react';
import { motion } from 'framer-motion';
import { DatabaseZap, Brain, Search, Filter, FileText, Loader2, AlertCircle, Table2, Zap, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import useDataManagement from '@/hooks/useDataManagement'; 

import FiltersAndQuery from '@/components/data-management/FiltersAndQuery';
import QueryResultsDisplay from '@/components/data-management/QueryResultsDisplay';

const FeaturePlaceholderCard = ({ title, description, icon: Icon, phase, category, className = "" }) => (
  <Card className={`bg-card shadow-lg hover:shadow-[var(--theme-accent-primary)]/20 transition-shadow duration-300 flex flex-col ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-[var(--theme-accent-primary)]" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
      {category && <p className="text-xs text-[var(--theme-accent-primary)]/80 mt-1">{category}</p>}
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between">
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      {phase && (
        <div className="text-xs text-[var(--theme-accent-primary)]/70 font-medium bg-[var(--theme-accent-primary)]/20 px-2 py-1 rounded-full inline-block self-start mt-auto">
          {phase}
        </div>
      )}
    </CardContent>
  </Card>
);


const DataManagementPage = () => {
  const {
    tables,
    fullSchema,
    loadingSchema, 
    loadingTables, 
    schemaError,
    fetchFullSchema, 
    
    selectedTable,
    setSelectedTable, 
    customQuery,
    setCustomQuery,
    queryResults,
    loadingQuery, 
    queryError,
    executeQuery, 
    applyPremadeReport,
    
    filters, 
    setFilters, 
    toast
  } = useDataManagement();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleApplyFilters = (appliedFilters) => {
    console.log("Filters applied in DataManagementPage:", appliedFilters);
    toast({ title: "Filters Applied", description: "Filter criteria captured (UI only for now)." });
  };

  const handleSelectReport = (report) => {
    applyPremadeReport(report);
  };

  const currentTableSchema = fullSchema && selectedTable ? fullSchema[selectedTable] : null;
  const columnsForSelectedTable = currentTableSchema?.columns || [];
  const loadingColumnsForSelectedTable = currentTableSchema?.loadingColumns || false;
  const errorForSelectedTableColumns = currentTableSchema?.error || schemaError; 

  const aiDataFeatures = [
    { title: "Predictive Analytics", description: "AI analyzes historical data to forecast trends, helping users make informed decisions.", icon: TrendingUp, category: "AI Data Insights", phase: "Future Enhancement" },
    { title: "Automated Query Optimization", description: "AI suggests SQL queries based on user behavior and schema, reducing manual input and improving performance.", icon: Zap, category: "AI Automation", phase: "Future Enhancement" },
    { title: "Smart Data Categorization", description: "AI auto-tags and classifies datasets, making search and retrieval more efficient.", icon: Filter, category: "AI Automation", phase: "Phase 4 (Covered)" },
    { title: "AI-Powered Insights Engine", description: "Leverage AI to automatically generate insights, summaries, and trend analysis from your data.", icon: Brain, category: "AI Data Insights", phase: "Phase 4 (Covered)" },
    { title: "Natural Language Querying", description: "Ask questions about your data in plain English and get AI-generated answers and reports.", icon: Search, category: "AI Collaboration", phase: "Phase 4 (Covered)" },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <DatabaseZap className="mr-3 h-8 w-8 text-[var(--theme-accent-primary)]" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Central</h1>
            <p className="text-muted-foreground">Explore, query, and manage your application data with upcoming AI enhancements.</p>
          </div>
        </div>
      </header>

      {(schemaError && !selectedTable) && ( 
        <Card className="bg-destructive/20 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><AlertCircle className="mr-2"/> Data Central Error</CardTitle>
          </CardHeader>
          <CardContent><p className="text-destructive/90">{schemaError}</p></CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <FiltersAndQuery 
            onApplyFilters={handleApplyFilters}
            onSelectReport={handleSelectReport}
            tables={tables}
            selectedTable={selectedTable}
            columns={columnsForSelectedTable}
            loadingTables={loadingTables}
            loadingColumns={loadingColumnsForSelectedTable}
            loadingQuery={loadingQuery}
            error={errorForSelectedTableColumns} 
            fetchTableDetails={ (tableName) => setSelectedTable(tableName) } 
            executeQuery={executeQuery}
            toast={toast}
            customQuery={customQuery}
            setCustomQuery={setCustomQuery}
          />
        </div>
        <div className="lg:col-span-2">
          <QueryResultsDisplay 
            queryResults={queryResults} 
            loadingQuery={loadingQuery} 
            selectedTable={selectedTable}
            error={queryError} 
            columnsMeta={columnsForSelectedTable} 
          />
        </div>
      </div>

      <section className="mt-8 pt-6 border-t border-border">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center justify-center">
                <Lightbulb className="mr-3 h-7 w-7 text-[var(--theme-accent-primary)]"/> AI-Driven Data Capabilities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Unlock deeper insights, automate tasks, and streamline data organization with upcoming AI-powered features.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiDataFeatures.map(feature => (
            <FeaturePlaceholderCard 
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                phase={feature.phase}
                category={feature.category}
            />
            ))}
        </div>
      </section>

    </motion.div>
  );
};

export default DataManagementPage;