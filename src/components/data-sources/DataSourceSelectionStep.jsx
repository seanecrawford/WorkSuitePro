import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Circle, CheckCircle } from 'lucide-react'; // Using Database as a generic icon

const dataSourceTypes = [
  { id: 'supabase', name: 'Supabase', description: 'Connect your Supabase project (PostgreSQL).', icon: Database },
  { id: 'postgresql', name: 'PostgreSQL', description: 'Connect a standard PostgreSQL database.', icon: Database },
  { id: 'mysql', name: 'MySQL', description: 'Connect a standard MySQL database.', icon: Database },
  { id: 'mssql', name: 'Microsoft SQL Server', description: 'Connect SQL Server. (Coming Soon)', icon: Database, disabled: true },
  { id: 'api', name: 'Generic API Endpoint', description: 'Connect to a custom API. (Coming Soon)', icon: Database, disabled: true },
];

const DataSourceSelectionStep = ({ formData, updateFormData }) => {
  const handleSelectType = (typeId) => {
    updateFormData({ sourceType: typeId });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
    hover: { scale: 1.03, boxShadow: "0px 10px 20px rgba(var(--color-primary-rgb), 0.1)" },
    tap: { scale: 0.97 }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Choose Data Source Type</h2>
      <p className="text-muted-foreground">Select the type of database or service you want to connect to Work Suite Pro.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSourceTypes.map((type, index) => (
          <motion.div
            key={type.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={!type.disabled ? "hover" : ""}
            whileTap={!type.disabled ? "tap" : ""}
          >
            <Card
              onClick={() => !type.disabled && handleSelectType(type.id)}
              className={`cursor-pointer transition-all duration-200 ease-in-out h-full flex flex-col
                ${formData.sourceType === type.id ? 'border-primary ring-2 ring-primary shadow-lg' : 'border-border hover:border-primary/70'}
                ${type.disabled ? 'opacity-60 cursor-not-allowed bg-muted/30' : 'bg-card hover:bg-accent/50'}`}
            >
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center">
                  <type.icon className={`h-6 w-6 mr-3 ${formData.sourceType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <CardTitle className="text-lg font-medium">{type.name}</CardTitle>
                </div>
                {formData.sourceType === type.id && <CheckCircle className="h-5 w-5 text-primary" />}
                {type.disabled && <Circle className="h-5 w-5 text-muted-foreground/50" />}
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-sm">{type.description}</CardDescription>
                 {type.disabled && <p className="text-xs text-amber-500 mt-2 font-semibold">Coming Soon</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DataSourceSelectionStep;