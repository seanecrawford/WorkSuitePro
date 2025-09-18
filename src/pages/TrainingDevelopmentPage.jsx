import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, CheckSquare, Users, Brain } from 'lucide-react';

const FeaturePlaceholderCard = ({ title, description, icon: Icon, phase, className = "" }) => (
  <Card className={`bg-card-alt-themed shadow-lg hover:shadow-[var(--theme-accent-training)]/20 transition-shadow duration-300 ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-[var(--theme-accent-training)]" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      <div className="text-xs text-[var(--theme-accent-training)]/80 font-medium bg-[var(--theme-accent-training)]/20 px-2 py-1 rounded-full inline-block">
        Coming in {phase}
      </div>
    </CardContent>
  </Card>
);


const PlaceholderContent = ({ title, children, icon: Icon }) => (
  <Card className="bg-card-themed border-card-themed shadow-lg text-card-themed-primary">
    <CardHeader>
       <div className="flex items-center gap-3">
        {Icon && <Icon className="h-7 w-7 text-[var(--theme-accent-training)]" />}
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


const TrainingDevelopmentPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };
  
  const futureFeatures = [
    { title: "Personalized Learning Paths", description: "AI-driven recommendations for courses and modules based on roles and skill gaps.", icon: Brain, phase: "Phase 3" },
    { title: "Interactive Quizzes & Assessments", description: "Engaging quizzes and assessments to measure learning and retention.", icon: CheckSquare, phase: "Phase 2" },
    { title: "Skills Matrix & Gap Analysis", description: "Visualize team skills and identify areas for development.", icon: Users, phase: "Phase 3" },
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
          <GraduationCap className="mr-3 h-8 w-8 text-[var(--theme-accent-training)]" /> Training & Development Hub
        </h1>
      </motion.div>

      <Tabs defaultValue="courses" className="w-full">
        <motion.div variants={itemVariants}>
          <TabsList className="tabs-training grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="courses">Available Courses</TabsTrigger>
            <TabsTrigger value="my-learning">My Learning</TabsTrigger>
            <TabsTrigger value="progress">Progress & Certificates</TabsTrigger>
            <TabsTrigger value="team-skills">Team Skills</TabsTrigger>
          </TabsList>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <TabsContent value="courses">
            <PlaceholderContent title="Available Courses" icon={BookOpen}>
               <div className="space-y-4">
                <p className="text-muted-foreground">Browse and enroll in available training modules and courses. Advanced features are on the way.</p>
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
          <TabsContent value="my-learning">
            <PlaceholderContent title="My Learning Path" icon={GraduationCap}/>
          </TabsContent>
          <TabsContent value="progress">
            <PlaceholderContent title="Learning Progress & Certificates" icon={CheckSquare}/>
          </TabsContent>
          <TabsContent value="team-skills">
            <PlaceholderContent title="Team Skills Overview" icon={Users}/>
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default TrainingDevelopmentPage;