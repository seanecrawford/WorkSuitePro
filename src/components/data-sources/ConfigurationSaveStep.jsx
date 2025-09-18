import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Zap, Settings, Info, CheckCircle } from 'lucide-react';

const ConfigurationSaveStep = ({ formData, updateFormData, currentUser }) => {
  // This is a conceptual step. Actual role-based permissions are complex.

  const handleConfigChange = (key, value) => {
    updateFormData({ configurations: { ...formData.configurations, [key]: value } });
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-xl font-semibold text-foreground">Final Configuration & Save</h2>
      <p className="text-muted-foreground">
        Review your settings for <strong className="text-primary">{formData.sourceName}</strong>. The connection will be saved upon clicking "Finish & Save".
      </p>

      <Card className="bg-card/70 backdrop-blur-md border-border">
        <CardHeader>
          <CardTitle className="flex items-center"><Settings className="h-5 w-5 mr-2 text-primary"/>Data Access & Sync Settings</CardTitle>
          <CardDescription>Configure how Work Suite Pro interacts with this data source.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="enable-sync" className="text-sm font-medium text-foreground">
                Enable Automatic Sync (Conceptual)
              </Label>
              <p className="text-xs text-muted-foreground">
                Periodically fetch new data. (Feature coming soon)
              </p>
            </div>
            <Switch
              id="enable-sync"
              checked={formData.configurations?.enableSync || false}
              onCheckedChange={(checked) => handleConfigChange('enableSync', checked)}
              disabled // Conceptual for now
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="role-based-access" className="text-sm font-medium text-foreground">
                Role-Based Permissions (Conceptual)
              </Label>
              <p className="text-xs text-muted-foreground">
                Define who can access this data within Work Suite Pro. (Feature coming soon)
              </p>
            </div>
            <Switch
              id="role-based-access"
              checked={formData.configurations?.roleBasedAccess || false}
              onCheckedChange={(checked) => handleConfigChange('roleBasedAccess', checked)}
              disabled // Conceptual for now
            />
          </div>
        </CardContent>
      </Card> {/* This was the missing closing Card tag */}

      <Alert className="bg-sky-900/40 border-sky-700/60">
        <Zap className="h-5 w-5 text-sky-400" />
        <AlertTitle className="text-sky-300">AI-Powered Error Assistance (Coming Soon)</AlertTitle>
        <AlertDescription className="text-sky-200/80 text-xs">
          If setup issues occur, Work Suite Pro's AI will soon provide suggestions to help you troubleshoot and resolve common connection or configuration problems.
        </AlertDescription>
      </Alert>
      
      {currentUser ? (
        <Alert className="bg-green-900/30 border-green-700/50 text-green-200">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <AlertTitle className="text-green-300">Ready to Save</AlertTitle>
          <AlertDescription>
            Click "Finish & Save" to store this data source configuration securely. A sample query will be run to verify integration accuracy (simulated).
          </AlertDescription>
        </Alert>
      ) : (
         <Alert className="bg-amber-900/30 border-amber-700/50 text-amber-200">
          <Info className="h-5 w-5 text-amber-400" />
          <AlertTitle className="text-amber-300">Public Demo Mode</AlertTitle>
          <AlertDescription>
            You are in public demo mode. Clicking "Finish & Save" will complete the wizard UI flow, but the data source configuration will not be persistently saved.
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  );
};

export default ConfigurationSaveStep;