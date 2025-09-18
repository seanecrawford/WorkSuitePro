import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FolderOpen, UploadCloud, Share2, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const FeaturePlaceholderCard = ({ title, description, icon: Icon, phase, className = "" }) => (
  <Card className={`bg-card-alt-themed shadow-lg hover:shadow-[var(--theme-accent-files)]/20 transition-shadow duration-300 ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-[var(--theme-accent-files)]" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      <div className="text-xs text-[var(--theme-accent-files)]/80 font-medium bg-[var(--theme-accent-files)]/20 px-2 py-1 rounded-full inline-block">
        Coming in {phase}
      </div>
    </CardContent>
  </Card>
);

const PlaceholderContent = ({ title, children, icon: Icon }) => (
  <Card className="bg-card-themed border-card-themed shadow-lg text-card-themed-primary">
    <CardHeader>
       <div className="flex items-center gap-3">
        {Icon && <Icon className="h-7 w-7 text-[var(--theme-accent-files)]" />}
        <CardTitle className="text-foreground">{title}</CardTitle>
      </div>
      <CardDescription className="text-muted-foreground">Functionality for {title.toLowerCase()} is under development or will be enhanced.</CardDescription>
    </CardHeader>
    <CardContent>
      {children || (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Content for {title} will appear here.</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const FileSharingPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };
  
  const futureFeatures = [
    { title: "Advanced Search & Filtering", description: "Powerful search capabilities with filters for file type, date, owner, and tags.", icon: Search, phase: "Phase 2" },
    { title: "Version Control", description: "Track file versions and revert to previous states.", icon: UploadCloud, phase: "Phase 2" },
    { title: "Secure Sharing Links", description: "Generate secure, password-protected, and time-limited sharing links.", icon: Share2, phase: "Phase 2" },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 p-4 md:p-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <FolderOpen className="mr-3 h-8 w-8 text-[var(--theme-accent-files)]" /> File Sharing & Document Management
        </h1>
      </motion.div>

      <Tabs defaultValue="my-files" className="w-full">
        <motion.div variants={itemVariants}>
          <TabsList className="tabs-files grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="my-files">My Files</TabsTrigger>
            <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="trash">Trash</TabsTrigger>
          </TabsList>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <TabsContent value="my-files">
            <PlaceholderContent title="My Files" icon={FolderOpen}>
              <div className="space-y-4">
                <p className="text-muted-foreground">Manage your personal and project-related files here. Enhanced features are coming soon.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {futureFeatures.map(feature => (
                    <FeaturePlaceholderCard 
                      key={feature.title}
                      title={feature.title}
                      description={feature.description}
                      icon={feature.icon}
                      phase={feature.phase}
                    />
                  ))}
                </div>
              </div>
            </PlaceholderContent>
          </TabsContent>
          <TabsContent value="shared-with-me">
            <PlaceholderContent title="Shared With Me" icon={Share2} />
          </TabsContent>
          <TabsContent value="recent">
            <PlaceholderContent title="Recent Files" icon={UploadCloud} />
          </TabsContent>
          <TabsContent value="trash">
            <PlaceholderContent title="Trash" icon={Search} />
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default FileSharingPage;