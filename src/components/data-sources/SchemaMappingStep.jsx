import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Settings2, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SchemaMappingStep = ({ formData, isConnecting, connectionError }) => {
  // Simulate schema fetching result for display purposes
  const simulatedSchemaInfo = {
    tablesCount: Math.floor(Math.random() * 20) + 5, // Random number of tables
    columnsCount: Math.floor(Math.random() * 100) + 50, // Random number of columns
  };

  return (
    <motion.div 
      className="space-y-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-semibold text-foreground">
        Connecting and Mapping Schema for <span className="text-primary capitalize">{formData.sourceName || formData.sourceType}</span>
      </h2>

      {isConnecting && (
        <div className="flex flex-col items-center justify-center p-8 bg-card/50 rounded-lg shadow-md">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
          <p className="text-lg text-muted-foreground">Attempting to connect and retrieve schema...</p>
          <p className="text-sm text-muted-foreground/70">This might take a moment (simulated).</p>
        </div>
      )}

      {!isConnecting && connectionError && (
        <Card className="bg-red-900/30 border-red-700/50 text-red-200 p-6">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
            <CardTitle className="text-xl text-red-300">Connection Failed</CardTitle>
            <CardDescription className="text-red-300/80 mt-2">
              Could not establish connection or retrieve schema for <span className="font-semibold">{formData.sourceName}</span>.
            </CardDescription>
            <p className="text-sm text-red-400 mt-1">{typeof connectionError === 'string' ? connectionError : connectionError.message || "Please check your credentials and network settings."}</p>
            <Button variant="outline" className="mt-4 border-red-500 text-red-300 hover:bg-red-700/30">
              Go Back & Edit Credentials
            </Button>
          </div>
        </Card>
      )}

      {!isConnecting && !connectionError && (
        <Card className="bg-green-900/20 border-green-700/40 text-green-200 p-8 shadow-xl">
          <div className="flex flex-col items-center">
            <CheckCircle className="h-20 w-20 text-green-400 mb-6" />
            <CardTitle className="text-3xl font-bold text-green-300 mb-3">Connection Successful!</CardTitle>
            <CardDescription className="text-lg text-green-300/90 mb-6 max-w-md">
              Work Suite Pro has successfully connected to <strong className="text-white">{formData.sourceName}</strong>.
            </CardDescription>

            <div className="bg-background/30 p-6 rounded-lg shadow-inner mb-6 w-full max-w-sm text-left">
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" /> Initial Scan Results (Simulated):
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Data Source Type:</span>
                  <span className="font-medium text-foreground capitalize">{formData.sourceType}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Tables Found:</span>
                  <span className="font-medium text-foreground">{simulatedSchemaInfo.tablesCount}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Total Columns Mapped:</span>
                  <span className="font-medium text-foreground">{simulatedSchemaInfo.columnsCount}</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg w-full max-w-lg">
                <h3 className="text-md font-semibold text-blue-300 mb-2 flex items-center">
                    <Settings2 className="h-5 w-5 mr-2"/>Next Steps: Advanced Schema Configuration
                </h3>
                <p className="text-xs text-blue-200/80">
                    Advanced schema mapping tools will be available soon. This will allow you to:
                </p>
                 <ul className="list-disc list-inside text-xs text-blue-200/80 space-y-1 mt-2 pl-2">
                    <li>Tag key tables and fields for automated workflows.</li>
                    <li>Define relationships and data types for precise integration.</li>
                    <li>Customize how your data is visualized in dashboards.</li>
                </ul>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              You can now proceed to finish the setup.
            </p>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default SchemaMappingStep;