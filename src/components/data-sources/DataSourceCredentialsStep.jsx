import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, Key, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const DataSourceCredentialsStep = ({ formData, updateFormData, onTestConnection, isTestingConnection, testConnectionResult }) => {
  const [credentials, setCredentials] = useState(formData.credentials || {});
  const [sourceName, setSourceName] = useState(formData.sourceName || '');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setCredentials(formData.credentials || {});
    setSourceName(formData.sourceName || '');
  }, [formData.sourceType, formData.credentials, formData.sourceName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSourceNameChange = (e) => {
    setSourceName(e.target.value);
  };

  const handleBlur = () => {
    updateFormData({ credentials, sourceName });
  };
  
  const renderCommonFields = () => (
    <>
      <div className="mb-4">
        <Label htmlFor="sourceName" className="text-sm font-medium text-foreground">Data Source Name</Label>
        <Input
          id="sourceName"
          name="sourceName"
          value={sourceName}
          onChange={handleSourceNameChange}
          onBlur={handleBlur}
          placeholder="e.g., My Production DB"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">A descriptive name for this connection.</p>
      </div>
    </>
  );

  const renderSupabaseFields = () => (
    <>
      {renderCommonFields()}
      <div>
        <Label htmlFor="projectUrl">Supabase Project URL</Label>
        <Input id="projectUrl" name="projectUrl" value={credentials.projectUrl || ''} onChange={handleChange} onBlur={handleBlur} placeholder="https://<your-project-ref>.supabase.co" />
      </div>
      <div>
        <Label htmlFor="anonKey">Supabase Anon Key</Label>
        <div className="relative">
          <Input id="anonKey" name="anonKey" type={showPassword ? 'text' : 'password'} value={credentials.anonKey || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Supabase Anon (public) Key" />
          <Button variant="ghost" size="icon" type="button" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Consider using a Service Role Key for backend operations, stored securely.</p>
      </div>
    </>
  );
  
  const renderPostgresSQLFields = () => (
    <>
      {renderCommonFields()}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="host">Host</Label>
          <Input id="host" name="host" value={credentials.host || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., localhost or db.example.com" />
        </div>
        <div>
          <Label htmlFor="port">Port</Label>
          <Input id="port" name="port" type="number" value={credentials.port || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., 5432" />
        </div>
      </div>
      <div>
        <Label htmlFor="user">User</Label>
        <Input id="user" name="user" value={credentials.user || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., adminuser" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
         <div className="relative">
            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={credentials.password || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Database Password" />
            <Button variant="ghost" size="icon" type="button" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="database">Database Name</Label>
        <Input id="database" name="database" value={credentials.database || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., myapp_production" />
      </div>
       <div>
        <Label htmlFor="connectionString" className="text-sm font-medium">Connection String (Optional)</Label>
        <Input 
          id="connectionString" 
          name="connectionString" 
          value={credentials.connectionString || ''} 
          onChange={handleChange} 
          onBlur={handleBlur} 
          placeholder="postgresql://user:password@host:port/database" 
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground mt-1">If provided, this will override individual fields.</p>
      </div>
    </>
  );

  const renderMySQLFields = () => (
    <>
      {renderCommonFields()}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="host">Host</Label>
          <Input id="host" name="host" value={credentials.host || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., localhost or db.example.com" />
        </div>
        <div>
          <Label htmlFor="port">Port</Label>
          <Input id="port" name="port" type="number" value={credentials.port || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., 3306" />
        </div>
      </div>
      <div>
        <Label htmlFor="user">User</Label>
        <Input id="user" name="user" value={credentials.user || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., adminuser" />
      </div>
       <div>
        <Label htmlFor="password">Password</Label>
         <div className="relative">
            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={credentials.password || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Database Password" />
            <Button variant="ghost" size="icon" type="button" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="database">Database Name</Label>
        <Input id="database" name="database" value={credentials.database || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., myapp_production" />
      </div>
      <div>
        <Label htmlFor="connectionString" className="text-sm font-medium">Connection String (Optional)</Label>
        <Input 
          id="connectionString" 
          name="connectionString" 
          value={credentials.connectionString || ''} 
          onChange={handleChange} 
          onBlur={handleBlur} 
          placeholder="mysql://user:password@host:port/database" 
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground mt-1">If provided, this will override individual fields.</p>
      </div>
    </>
  );
  
  let fieldsComponent;
  switch (formData.sourceType) {
    case 'supabase':
      fieldsComponent = renderSupabaseFields();
      break;
    case 'postgresql':
      fieldsComponent = renderPostgresSQLFields();
      break;
    case 'mysql':
      fieldsComponent = renderMySQLFields();
      break;
    default:
      fieldsComponent = <p className="text-muted-foreground">Please select a data source type first.</p>;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h2 className="text-xl font-semibold text-foreground">Configure <span className="capitalize text-primary">{formData.sourceType || 'Data Source'}</span> Credentials</h2>
      
      <Alert className="bg-blue-900/30 border-blue-700/50 text-blue-200">
        <Info className="h-5 w-5 text-blue-400" />
        <AlertTitle className="text-blue-300">Secure Connection Recommended</AlertTitle>
        <AlertDescription>
          For production environments, always use SSL/TLS encryption if available. It's also best practice to use dedicated database users with the least privileges necessary for Work Suite Pro.
        </AlertDescription>
      </Alert>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {fieldsComponent}
      </form>

      {testConnectionResult && (
        <Alert variant={testConnectionResult.success ? "default" : "destructive"} className={`${testConnectionResult.success ? 'bg-green-900/30 border-green-700/50 text-green-200' : 'bg-red-900/30 border-red-700/50 text-red-200'}`}>
          {testConnectionResult.success ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
          <AlertTitle className={`${testConnectionResult.success ? 'text-green-300' : 'text-red-300'}`}>{testConnectionResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}</AlertTitle>
          <AlertDescription>
            {testConnectionResult.message}
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  );
};

export default DataSourceCredentialsStep;