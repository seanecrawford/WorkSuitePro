import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { seedPersonnel } from '@/../scripts/seed.js'; // Adjusted path
import { Loader2, DatabaseBackup, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const SeedDatabaseAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState([]);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessages(["Seeding process initiated..."]);

    const progressCallback = (message) => {
      setStatusMessages(prevMessages => [...prevMessages, message]);
    };

    try {
      const result = await seedPersonnel(2000, progressCallback);
      toast({
        title: "Seeding Successful",
        description: result || "Database has been seeded with 2000 personnel records.",
        variant: "default",
      });
      setStatusMessages(prevMessages => [...prevMessages, "✅ Seeding process completed successfully!"]);
    } catch (err) {
      console.error("Seeding failed:", err);
      setError(err.message || "An unknown error occurred during seeding.");
      toast({
        title: "Seeding Failed",
        description: err.message || "Could not seed the database.",
        variant: "destructive",
      });
      setStatusMessages(prevMessages => [...prevMessages, `❌ Error: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-8"
    >
      <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <DatabaseBackup className="mr-3 h-7 w-7 text-primary" />
            Database Seed Utility
          </CardTitle>
          <CardDescription>
            Use this utility to populate the 'personnel' table with approximately 2000 sample records.
            This is for development and testing purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Clicking the button below will start the seeding process. It may take a few minutes to complete.
            Please do not navigate away from this page while seeding is in progress.
          </p>
          
          <Button
            onClick={handleSeedDatabase}
            disabled={isLoading}
            className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Seeding in Progress...
              </>
            ) : (
              "Start Seeding Personnel Data"
            )}
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive"
            >
              <div className="flex items-center font-semibold">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Seeding Error
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </motion.div>
          )}

          {statusMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 border rounded-md bg-muted/50 max-h-60 overflow-y-auto"
            >
              <h3 className="font-semibold text-foreground mb-2">Progress:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {statusMessages.map((msg, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {msg}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-4">
            This page is for administrative use and can be removed after seeding is complete if desired.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SeedDatabaseAdminPage;