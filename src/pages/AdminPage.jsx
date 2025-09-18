import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import SeedingCard from '@/components/admin/SeedingCard';
import SeedingProgress from '@/components/admin/SeedingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


import { seedCoreData, seedChatDataOnly, seedHrSuiteData, seedMaintenanceData, seedCrmData } from '@/../scripts/seed.js';
import { seedV2XData } from '@/../scripts/seed-v2x-data.js';
import { seedDefenseDataSuite } from '@/../scripts/seed-defense-data.js';
import { seedInventoryData } from '@/../scripts/seed-data/inventory.js'; 

import { Database, Car, ShieldCheck, Package, AlertTriangle, FileCheck2, SearchCheck, Zap, Rocket, MessageSquare, HeartHandshake, Wrench, UserCog } from 'lucide-react';

const FeaturePlaceholderCard = ({ title, description, icon: Icon, category, phase, className = "" }) => (
  <Card className={`bg-card shadow-lg hover:shadow-[var(--theme-accent-red)]/20 transition-shadow duration-300 flex flex-col ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-[var(--theme-accent-red)]" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
      {category && <p className="text-xs text-[var(--theme-accent-red)]/80 mt-1">{category}</p>}
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between">
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      {phase && (
        <div className="text-xs text-[var(--theme-accent-red)]/70 font-medium bg-[var(--theme-accent-red)]/20 px-2 py-1 rounded-full inline-block self-start mt-auto">
          {phase}
        </div>
      )}
    </CardContent>
  </Card>
);


const AdminPage = () => {
  const { toast } = useToast();
  const [isLoadingCore, setIsLoadingCore] = useState(false);
  const [isLoadingV2X, setIsLoadingV2X] = useState(false);
  const [isLoadingDefense, setIsLoadingDefense] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false); 
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingHR, setIsLoadingHR] = useState(false);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(false);
  const [isLoadingCRM, setIsLoadingCRM] = useState(false);


  const [statusMessages, setStatusMessages] = useState([]);
  const [seedError, setSeedError] = useState(null);

  const progressCallback = useCallback((message) => {
    setStatusMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const handleSeedDatabase = async (seedFunction, setIsLoading, seedType) => {
    setIsLoading(true);
    setSeedError(null);
    setStatusMessages([`🚀 ${seedType} seeding process initiated... Please wait.`]);

    try {
      const result = await seedFunction(progressCallback);
      toast({
        title: `${seedType} Seeding Successful`,
        description: result || `${seedType} data has been seeded.`,
        variant: "default",
        duration: 5000,
      });
      setStatusMessages(prevMessages => [...prevMessages, `✅ ${seedType} seeding process completed successfully!`]);
    } catch (err) {
      console.error(`${seedType} seeding failed:`, err);
      setSeedError(err.message || `An unknown error occurred during ${seedType} seeding.`);
      toast({
        title: `${seedType} Seeding Failed`,
        description: err.message || `Could not seed ${seedType} data.`,
        variant: "destructive",
        duration: 7000,
      });
      setStatusMessages(prevMessages => [...prevMessages, `❌ Error during ${seedType} seeding: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const aiSecurityFeatures = [
    { title: "Anomaly Detection", description: "AI identifies unusual database activity and user behavior to prevent security breaches.", icon: AlertTriangle, category: "AI Security", phase: "Future Enhancement" },
    { title: "Automated Compliance Checks", description: "AI scans records and configurations for regulatory compliance issues (e.g., GDPR, HIPAA).", icon: FileCheck2, category: "AI Compliance", phase: "Future Enhancement" },
    { title: "Fraud Detection", description: "AI flags suspicious transactions and activities in financial and operational data.", icon: SearchCheck, category: "AI Security", phase: "Future Enhancement" },
  ];

  const handleCustomAction = () => {
    toast({
      title: "Custom Action Triggered!",
      description: "You clicked the new custom admin button!",
      variant: "default",
      duration: 3000,
    });
  };


  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-y-auto scrollbar-thin">
      <AdminHeader />
      
      <motion.main 
        className="flex-grow p-4 md:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--theme-accent-primary)] mb-4">Database Seeding Utilities</h2>
          <p className="text-muted-foreground mb-6">
            Use these utilities to populate your database with sample data for different modules. 
            This is primarily for development and demonstration purposes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SeedingCard
              title="Core System Data"
              description="Seeds essential data like projects, personnel, financials, etc. Includes HR, Maintenance, and CRM Data."
              Icon={Database}
              iconColorClass="text-[var(--theme-accent-sky)]"
              seedFunction={seedCoreData}
              isLoading={isLoadingCore}
              setIsLoading={setIsLoadingCore}
              isDisabled={isLoadingV2X || isLoadingDefense || isLoadingInventory || isLoadingChat || isLoadingHR || isLoadingMaintenance || isLoadingCRM}
              buttonText="Seed Core Data"
              buttonGradientClass="from-[var(--theme-accent-sky)]/80 to-[var(--theme-accent-sky)] hover:from-[var(--theme-accent-sky)] hover:to-[var(--theme-accent-sky)]/90"
              seedType="Core System"
              handleSeedDatabase={handleSeedDatabase}
            />
            <SeedingCard
              title="HR Suite Data"
              description="Populates HR specific tables: Leave, Payroll, Benefits, Reviews, Documents."
              Icon={HeartHandshake}
              iconColorClass="text-[var(--theme-accent-pink)]"
              seedFunction={seedHrSuiteData}
              isLoading={isLoadingHR}
              setIsLoading={setIsLoadingHR}
              isDisabled={isLoadingCore || isLoadingV2X || isLoadingDefense || isLoadingInventory || isLoadingChat || isLoadingMaintenance || isLoadingCRM}
              buttonText="Seed HR Data"
              buttonGradientClass="from-[var(--theme-accent-pink)]/80 to-[var(--theme-accent-pink)] hover:from-[var(--theme-accent-pink)] hover:to-[var(--theme-accent-pink)]/90"
              seedType="HR Suite"
              handleSeedDatabase={handleSeedDatabase}
            />
            <SeedingCard
              title="V2X Demo Data"
              description="Populates tables related to Vehicle-to-Everything (V2X) simulations."
              Icon={Car}
              iconColorClass="text-[var(--theme-accent-green)]"
              seedFunction={seedV2XData}
              isLoading={isLoadingV2X}
              setIsLoading={setIsLoadingV2X}
              isDisabled={isLoadingCore || isLoadingDefense || isLoadingInventory || isLoadingChat || isLoadingHR || isLoadingMaintenance || isLoadingCRM}
              buttonText="Seed V2X Data"
              buttonGradientClass="from-[var(--theme-accent-green)]/80 to-[var(--theme-accent-green)] hover:from-[var(--theme-accent-green)] hover:to-[var(--theme-accent-green)]/90"
              seedType="V2X Demo"
              handleSeedDatabase={handleSeedDatabase}
            />
            <SeedingCard
              title="Defense Demo Data"
              description="Adds sample data for defense-specific modules and entities."
              Icon={ShieldCheck}
              iconColorClass="text-[var(--theme-accent-red)]"
              seedFunction={seedDefenseDataSuite}
              isLoading={isLoadingDefense}
              setIsLoading={setIsLoadingDefense}
              isDisabled={isLoadingCore || isLoadingV2X || isLoadingInventory || isLoadingChat || isLoadingHR || isLoadingMaintenance || isLoadingCRM}
              buttonText="Seed Defense Data"
              buttonGradientClass="from-[var(--theme-accent-red)]/80 to-[var(--theme-accent-red)] hover:from-[var(--theme-accent-red)] hover:to-[var(--theme-accent-red)]/90"
              seedType="Defense Demo"
              handleSeedDatabase={handleSeedDatabase}
            />
            <SeedingCard
              title="Inventory Demo Data"
              description="Populates inventory, suppliers, and purchase orders with sample data."
              Icon={Package}
              iconColorClass="text-[var(--theme-accent-amber)]"
              seedFunction={seedInventoryData}
              isLoading={isLoadingInventory}
              setIsLoading={setIsLoadingInventory}
              isDisabled={isLoadingCore || isLoadingV2X || isLoadingDefense || isLoadingChat || isLoadingHR || isLoadingMaintenance || isLoadingCRM}
              buttonText="Seed Inventory Data"
              buttonGradientClass="from-[var(--theme-accent-amber)]/80 to-[var(--theme-accent-amber)] hover:from-[var(--theme-accent-amber)] hover:to-[var(--theme-accent-amber)]/90"
              seedType="Inventory Demo"
              handleSeedDatabase={handleSeedDatabase}
            />
             <SeedingCard
              title="Chat Demo Data"
              description="Populates chat groups, members, and messages with sample data."
              Icon={MessageSquare}
              iconColorClass="text-[var(--theme-accent-purple)]"
              seedFunction={seedChatDataOnly}
              isLoading={isLoadingChat}
              setIsLoading={setIsLoadingChat}
              isDisabled={isLoadingCore || isLoadingV2X || isLoadingDefense || isLoadingInventory || isLoadingHR || isLoadingMaintenance || isLoadingCRM}
              buttonText="Seed Chat Data"
              buttonGradientClass="from-[var(--theme-accent-purple)]/80 to-[var(--theme-accent-purple)] hover:from-[var(--theme-accent-purple)] hover:to-[var(--theme-accent-purple)]/90"
              seedType="Chat Demo"
              handleSeedDatabase={handleSeedDatabase}
            />
            <SeedingCard
              title="Maintenance Demo Data"
              description="Populates equipment and maintenance schedules with sample data."
              Icon={Wrench}
              iconColorClass="text-[var(--theme-accent-orange)]"
              seedFunction={seedMaintenanceData}
              isLoading={isLoadingMaintenance}
              setIsLoading={setIsLoadingMaintenance}
              isDisabled={isLoadingCore || isLoadingV2X || isLoadingDefense || isLoadingInventory || isLoadingChat || isLoadingHR || isLoadingCRM}
              buttonText="Seed Maintenance Data"
              buttonGradientClass="from-[var(--theme-accent-orange)]/80 to-[var(--theme-accent-orange)] hover:from-[var(--theme-accent-orange)] hover:to-[var(--theme-accent-orange)]/90"
              seedType="Maintenance Demo"
              handleSeedDatabase={handleSeedDatabase}
            />
             <SeedingCard
              title="CRM Demo Data"
              description="Populates companies, contacts, deals, and communication logs."
              Icon={UserCog}
              iconColorClass="text-[var(--theme-accent-teal)]"
              seedFunction={seedCrmData}
              isLoading={isLoadingCRM}
              setIsLoading={setIsLoadingCRM}
              isDisabled={isLoadingCore || isLoadingV2X || isLoadingDefense || isLoadingInventory || isLoadingChat || isLoadingHR || isLoadingMaintenance}
              buttonText="Seed CRM Data"
              buttonGradientClass="from-[var(--theme-accent-teal)]/80 to-[var(--theme-accent-teal)] hover:from-[var(--theme-accent-teal)] hover:to-[var(--theme-accent-teal)]/90"
              seedType="CRM Demo"
              handleSeedDatabase={handleSeedDatabase}
            />
          </div>
        </motion.section>

        <SeedingProgress seedError={seedError} statusMessages={statusMessages} />

        <motion.section variants={itemVariants} className="my-8">
          <h2 className="text-2xl font-semibold text-[var(--theme-accent-primary)] mb-4">Custom Actions</h2>
          <Card className="bg-card-themed">
            <CardHeader>
              <CardTitle>Example Custom Button</CardTitle>
              <CardDescription>This is an example of a newly added button.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCustomAction} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Launch Custom Admin Action
              </Button>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={itemVariants} className="my-12 pt-8 border-t border-border">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-[var(--theme-accent-red)] mb-2 flex items-center justify-center">
                    <Zap className="mr-3 h-7 w-7 text-[var(--theme-accent-red)]"/> AI-Enhanced Security & Compliance
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Future-proof your platform with AI-driven security monitoring and automated compliance checks.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiSecurityFeatures.map(feature => (
                    <FeaturePlaceholderCard 
                        key={feature.title}
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                        category={feature.category}
                        phase={feature.phase}
                    />
                ))}
            </div>
        </motion.section>
      </motion.main>
    </div>
  );
};

export default AdminPage;