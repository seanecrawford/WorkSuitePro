import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Database, Key, CheckCircle, Loader2, ListChecks, Settings, ShieldCheck } from 'lucide-react';
import DataSourceSelectionStep from './DataSourceSelectionStep';
import DataSourceCredentialsStep from './DataSourceCredentialsStep';
import TableSelectionStep from './TableSelectionStep'; 
import FieldMappingStep from './FieldMappingStep'; 
import ConfigurationSaveStep from './ConfigurationSaveStep'; 
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient'; 

const STEPS = [
  { id: 'selection', title: 'Select Data Source Type', icon: Database, component: DataSourceSelectionStep, description: "Choose the type of database or service you're connecting." },
  { id: 'credentials', title: 'Enter Credentials & Test', icon: Key, component: DataSourceCredentialsStep, description: "Provide connection details and test the connection." },
  { id: 'tableSelection', title: 'Select Tables & Preview Schema', icon: ListChecks, component: TableSelectionStep, description: "Choose tables and preview their structure." },
  { id: 'fieldMapping', title: 'Map Fields (Conceptual)', icon: Settings, component: FieldMappingStep, description: "Define how table columns map to platform features." },
  { id: 'configurationSave', title: 'Configure & Save', icon: ShieldCheck, component: ConfigurationSaveStep, description: "Finalize settings and save your data source." },
];

const DataSourceWizard = ({ onComplete, onCancel, currentUser }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    sourceType: null,
    credentials: {},
    sourceName: '',
    selectedTables: [], 
    fieldMappings: {}, 
    configurations: {}, 
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState(null);
  const [availableTables, setAvailableTables] = useState([]); 
  const [loadingTables, setLoadingTables] = useState(false); 

  const { toast } = useToast();

  const CurrentStepComponent = STEPS[currentStepIndex].component;
  const CurrentStepIcon = STEPS[currentStepIndex].icon;
  const progressValue = ((currentStepIndex + 1) / STEPS.length) * 100;

  const fetchTablesForSource = useCallback(async () => {
    if (!formData.sourceType || !testConnectionResult?.success) {
      if (!testConnectionResult?.success && currentStepIndex === 2) {
        toast({ title: "Connection Required", description: "Test connection successfully before fetching tables.", variant: "default" });
      }
      return;
    }
    setLoadingTables(true);
    setAvailableTables([]); 
    try {
      // For Supabase, use the RPC to get tables. For other types, simulate for now.
      if (formData.sourceType === 'supabase') {
        const { data, error } = await supabase.rpc('get_all_table_names_excluding_system');
        if (error) throw error;
        const fetchedTables = (data || []).map(t => ({ name: t.table_name, schema: 'public' })); // Assuming public for simplicity
        setAvailableTables(fetchedTables);
        toast({ title: "Tables Fetched", description: `Found ${fetchedTables.length} tables for ${formData.sourceName}.` });
      } else {
        // Simulate for other DB types for now
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const simulatedTables = [
          { name: `sample_table_1_${formData.sourceType}`, schema: 'public' },
          { name: `sample_table_2_${formData.sourceType}`, schema: 'public' },
          { name: `another_view_${formData.sourceType}`, schema: 'custom' },
        ];
        setAvailableTables(simulatedTables);
        toast({ title: "Tables Fetched (Simulated)", description: `Found ${simulatedTables.length} tables for ${formData.sourceName}.` });
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({ title: "Error Fetching Tables", description: error.message || "An unknown error occurred.", variant: "destructive" });
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  }, [formData.sourceType, formData.sourceName, testConnectionResult?.success, toast, currentStepIndex]);
  
  useEffect(() => {
    if (currentStepIndex === 2 && testConnectionResult?.success && !loadingTables) {
        // Only fetch if tables haven't been fetched yet for this connection, or if forced.
        // A simple check like availableTables.length === 0 might be too simplistic if we allow re-fetching.
        // For now, if we enter step 2 with a successful test, we fetch.
        fetchTablesForSource();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, testConnectionResult?.success]);


  const handleNext = () => {
    if (currentStepIndex === 0 && !formData.sourceType) {
      toast({ title: "Selection Required", description: "Please select a data source type.", variant: "destructive" });
      return;
    }
    if (currentStepIndex === 1 && !formData.sourceName.trim()) {
      toast({ title: "Name Required", description: "Please provide a name for this data source.", variant: "destructive" });
      return;
    }
    if (currentStepIndex === 1 && !testConnectionResult?.success) {
      toast({ title: "Connection Test Required", description: "Please test the connection successfully before proceeding.", variant: "destructive" });
      return;
    }
    
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleSaveConnection();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      if (currentStepIndex === 1) setTestConnectionResult(null); 
      if (currentStepIndex === 2) setAvailableTables([]); 
    }
  };

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestConnectionResult(null);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    let success = false;
    let message = "";

    if (!formData.sourceName.trim()) {
        message = "Please enter a Data Source Name before testing.";
    } else if (formData.sourceType === 'supabase') {
      if (formData.credentials?.projectUrl && formData.credentials?.anonKey) {
        success = true; message = "Supabase connection successful (simulated).";
      } else { message = "Supabase Project URL and Anon Key are required."; }
    } else if (formData.sourceType === 'postgresql' || formData.sourceType === 'mysql') {
       if ((formData.credentials?.connectionString) || (formData.credentials?.host && formData.credentials?.port && formData.credentials?.user && formData.credentials?.password && formData.credentials?.database)) {
        success = true; message = `${formData.sourceType.toUpperCase()} connection successful (simulated).`;
      } else { message = `All essential ${formData.sourceType.toUpperCase()} fields (or a connection string) are required.`; }
    } else {
      message = "Unsupported data source type for testing.";
    }

    setTestConnectionResult({ success, message });
    setIsTestingConnection(false);
    toast({ title: success ? "Connection Test Successful" : "Connection Test Failed", description: message, variant: success ? "default" : "destructive" });
  };

  const handleSaveConnection = async () => {
    toast({ title: "Saving Data Source", description: "Attempting to save...", className: "bg-blue-600 text-white" });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!currentUser) {
      toast({ title: "Public Mode", description: "Saving data sources is disabled in public demo mode.", variant: "default" });
      onComplete(formData);
      return;
    }

    try {
      const { data: insertedData, error } = await supabase.from('user_data_sources').insert([
        {
          user_id: currentUser.id,
          source_name: formData.sourceName,
          db_type: formData.sourceType,
          connection_details_encrypted: JSON.stringify(formData.credentials), 
          schema_mapping_preferences: formData.fieldMappings, 
          is_active: true,
          last_test_successful: testConnectionResult?.success || false, 
          last_tested_at: testConnectionResult ? new Date().toISOString() : null,
        },
      ]).select();

      if (error) throw error;

      toast({ title: "Data Source Saved", description: `${formData.sourceName} configured successfully.`, className: "bg-green-600 text-white" });
      onComplete(formData, insertedData ? insertedData[0] : null); // Pass back the saved data if needed

    } catch (error) {
        console.error("Error saving data source:", error);
        toast({ title: "Save Failed", description: `Could not save data source: ${error.message}`, variant: "destructive" });
    }
  };
  

  const wizardVariants = {
    enter: { opacity: 0, scale: 0.95, y: 20 },
    center: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -20 },
  };

  const NextStepIcon = currentStepIndex < STEPS.length - 1 && STEPS[currentStepIndex + 1] ? STEPS[currentStepIndex + 1].icon : null;


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <Card className="w-full max-w-3xl bg-card shadow-2xl border-border">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <CurrentStepIcon className="h-7 w-7 mr-3 text-primary" />
              <CardTitle className="text-2xl text-primary">{STEPS[currentStepIndex].title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          </div>
          <CardDescription>Step {currentStepIndex + 1} of {STEPS.length}. {STEPS[currentStepIndex].description || "Follow the prompts to connect your data source."}</CardDescription>
          <Progress value={progressValue} className="w-full h-2 mt-2" />
        </CardHeader>
        
        <CardContent className="min-h-[350px] py-6 px-6 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              variants={wizardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CurrentStepComponent 
                formData={formData} 
                updateFormData={updateFormData}
                onTestConnection={handleTestConnection}
                isTestingConnection={isTestingConnection}
                testConnectionResult={testConnectionResult}
                availableTables={availableTables} 
                loadingTables={loadingTables} 
                fetchTablesForSource={fetchTablesForSource} 
                currentUser={currentUser} 
              />
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t pt-4 pb-4 px-6 md:px-8">
          <Button variant="outline" onClick={handleBack} disabled={currentStepIndex === 0 || isTestingConnection}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center space-x-2">
            {currentStepIndex === 1 && ( 
              <Button variant="secondary" onClick={handleTestConnection} disabled={isTestingConnection || !formData.sourceType || !formData.sourceName.trim()}>
                {isTestingConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                Test Connection
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              disabled={isTestingConnection || (currentStepIndex === 1 && !testConnectionResult?.success)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {currentStepIndex === STEPS.length - 1 ? 'Finish & Save' : 'Next'}
              {NextStepIcon && <NextStepIcon className="ml-2 h-4 w-4" />}
              {currentStepIndex === STEPS.length - 1 && !NextStepIcon && <CheckCircle className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DataSourceWizard;