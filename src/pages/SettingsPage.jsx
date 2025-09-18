import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, AlertCircle, Palette, Database, Key, FunctionSquare } from 'lucide-react';

const SettingsPage = () => {
  const [theme, setTheme] = useState('system');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6'); // Default to Tailwind blue-500
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kgzvjkuxhhanomuzjyfj.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnenZqa3V4aGhhbm9tdXpqeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTI5NzYsImV4cCI6MjA2MzA4ODk3Nn0.D0mZV1SFSUKeg5-NOqkLvhdPnamHBc1VqOCGfqFMwjw';

  const configuredEdgeFunctions = [
    "generate-avatar", "login-with-username", "summarize-text", "fetch-industry-news", 
    "zoho-oauth-redirect", "zoho-oauth-callback", "custom-hello-world", "diagnose-supabase-issue"
  ];
  const configuredSecrets = [
    "OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", 
    "SUPABASE_DB_URL", "FUNC_SUPABASE_URL", "FUNC_SUPABASE_ANON_KEY", 
    "ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET"
  ];

  const handleTestConnection = async () => {
    try {
      const { data, error } = await supabase.from('regions').select('regionname').limit(1);
      if (error) throw error;
      if (data) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Supabase and fetched data.",
          variant: "default",
          className: "bg-green-600 border-green-700 text-white",
          icon: <CheckCircle className="h-5 w-5 text-white" />,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to Supabase.",
        variant: "destructive",
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-4 md:p-6"
    >
      <motion.h1 
        variants={cardVariants}
        className="text-3xl font-bold tracking-tight text-foreground"
      >
        Settings
      </motion.h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={cardVariants}>
          <Card className="bg-card/80 backdrop-blur-sm shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-sky-400"><Palette className="mr-2 h-5 w-5" />Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the console.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme" className="w-full bg-background/70 border-slate-600">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectItem value="light" className="hover:!bg-slate-700 focus:!bg-slate-700">Light</SelectItem>
                    <SelectItem value="dark" className="hover:!bg-slate-700 focus:!bg-slate-700">Dark</SelectItem>
                    <SelectItem value="system" className="hover:!bg-slate-700 focus:!bg-slate-700">System</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground mt-1">Note: Full theme switching logic is illustrative.</p>
              </div>
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="primary-color" 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="w-12 h-10 p-1 bg-background/70 border-slate-600"
                  />
                  <Input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-background/70 border-slate-600 flex-grow" 
                    readOnly 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Note: Color picker is illustrative.</p>
              </div>
               <Button variant="secondary" className="w-full">Apply Appearance Settings</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="lg:col-span-2">
          <Card className="bg-card/80 backdrop-blur-sm shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-sky-400"><Database className="mr-2 h-5 w-5" />Supabase Configuration</CardTitle>
              <CardDescription>Manage your Supabase project connection details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="supabase-url">Supabase Project URL</Label>
                <Input id="supabase-url" value={supabaseUrl} readOnly className="bg-background/50 border-slate-700 font-mono text-xs" />
              </div>
              <div>
                <Label htmlFor="supabase-anon-key">Supabase Anon Key</Label>
                <Input id="supabase-anon-key" value={supabaseAnonKey} readOnly className="bg-background/50 border-slate-700 font-mono text-xs" />
                 <p className="text-xs text-muted-foreground mt-1">These values are typically set via environment variables and are shown for reference.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center"><FunctionSquare className="mr-2 h-4 w-4 text-teal-400"/>Configured Edge Functions:</h4>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 max-h-24 overflow-y-auto bg-slate-800/50 p-2 rounded-md border border-slate-700">
                    {configuredEdgeFunctions.map(fn => <li key={fn}>{fn}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center"><Key className="mr-2 h-4 w-4 text-amber-400"/>Configured Secrets:</h4>
                   <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 max-h-24 overflow-y-auto bg-slate-800/50 p-2 rounded-md border border-slate-700">
                    {configuredSecrets.map(secret => <li key={secret}>{secret}</li>)}
                  </ul>
                </div>
              </div>

              <Button onClick={handleTestConnection} className="w-full bg-teal-600 hover:bg-teal-500 text-white">
                <CheckCircle className="mr-2 h-4 w-4" /> Test Supabase Connection
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
         <motion.div variants={cardVariants} className="lg:col-span-3">
          <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information. (Functionality pending full user profile implementation)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Demo User" className="bg-background/70 border-slate-600" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="user@example.com" className="bg-background/70 border-slate-600" readOnly />
              </div>
              <Button variant="secondary" disabled>Save Profile Changes</Button>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default SettingsPage;