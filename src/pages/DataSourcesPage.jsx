import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DatabaseZap, PlusCircle, ChevronRight, CheckCircle, AlertTriangle, Loader2, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import DataSourceWizard from '@/components/data-sources/DataSourceWizard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const DataSourcesPage = () => {
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [error, setError] = useState(null);
  const [showWizard, setShowWizard] = useState(false);

  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    setError(null);
    // Since auth is removed, we show sample data.
    setDataSources([
      { id: 'sample-1', source_name: 'Sample Supabase DB', db_type: 'supabase', last_test_successful: true, last_tested_at: new Date().toISOString(), isSample: true },
      { id: 'sample-2', source_name: 'Demo PostgreSQL', db_type: 'postgresql', last_test_successful: false, last_tested_at: new Date(Date.now() - 86400000).toISOString(), isSample: true },
    ]);
    setLoadingSources(false);
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleWizardComplete = () => {
    setShowWizard(false);
    toast({ title: "Data Source Setup", description: "Configuration complete (demo mode)." });
  };
  
  const handleWizardCancel = () => {
    setShowWizard(false);
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const listItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };
  
  if (showWizard) {
    return <DataSourceWizard 
             onComplete={handleWizardComplete} 
             onCancel={handleWizardCancel} 
           />;
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <DatabaseZap className="mr-3 h-8 w-8 text-[var(--theme-accent-primary)]" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Sources</h1>
            <p className="text-muted-foreground">Connect and manage your external data sources.</p>
          </div>
        </div>
        <Button onClick={() => setShowWizard(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Connect New Data Source
        </Button>
      </header>

      {error && (
        <Card className="bg-destructive/20 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/> Error</CardTitle>
          </CardHeader>
          <CardContent><p className="text-destructive/90">{error}</p></CardContent>
        </Card>
      )}

      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground">Connected Data Sources</CardTitle>
          <CardDescription className="text-muted-foreground">View and manage your currently configured data sources.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSources ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : dataSources.length === 0 ? (
            <div className="text-center py-10">
              <DatabaseZap className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Data Sources Connected</h3>
              <p className="text-muted-foreground mb-4">Get started by connecting your first data source.</p>
              <Button onClick={() => setShowWizard(true)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <PlusCircle className="mr-2 h-4 w-4" /> Connect a Data Source
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {dataSources.map((source, index) => (
                <motion.li
                  key={source.id}
                  custom={index}
                  variants={listItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Card className="bg-background/50 hover:shadow-md transition-shadow border-border">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center flex-grow">
                        {source.last_test_successful ? (
                          <CheckCircle className="h-6 w-6 text-[var(--theme-accent-green)] mr-3 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-[var(--theme-accent-red)] mr-3 flex-shrink-0" />
                        )}
                        <div className="flex-grow">
                          <h4 className="font-semibold text-foreground text-lg">{source.source_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Type: <span className="font-medium capitalize">{source.db_type}</span>
                            {source.last_tested_at && (
                              <span className="ml-2 text-xs">
                                Last tested: {new Date(source.last_tested_at).toLocaleDateString()} - 
                                <span className={source.last_test_successful ? 'text-[var(--theme-accent-green)]' : 'text-[var(--theme-accent-red)]'}>
                                  {source.last_test_successful ? ' OK' : ' Failed'}
                                </span>
                              </span>
                            )}
                          </p>
                          {source.isSample && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">Sample</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0 self-start sm:self-center">
                         <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" asChild>
                            <Link to={`/data-management`}>
                            <ChevronRight className="h-5 w-5" />
                            </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
            Manage connections here. For data exploration, use the "Data Management" page.
        </CardFooter>
      </Card>
      
      <Card className="bg-card shadow-lg">
          <CardHeader>
              <CardTitle className="text-lg text-foreground">Data Security and Privacy</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                  Work Suite Pro takes your data security seriously. When connecting external data sources:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Credentials will be securely stored.</li>
                  <li>We recommend using dedicated read-only database users with minimal necessary permissions.</li>
                  <li>Data fetched is processed in memory and not stored long-term unless explicitly configured by you for caching or specific features.</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                For more details, please review our <Link to="/information" className="text-primary hover:underline">Data Handling Policy</Link>.
              </p>
          </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataSourcesPage;