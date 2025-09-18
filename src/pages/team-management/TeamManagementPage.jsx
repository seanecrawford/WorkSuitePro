import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, Briefcase, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TeamManagementPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 space-y-6"
    >
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-[var(--theme-accent-team)]" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Management</h1>
            <p className="text-muted-foreground">Organize teams, manage roles, and view member details.</p>
          </div>
        </div>
        <Button className="btn-primary-themed">
          <UserPlus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </motion.header>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle />
              Under Construction
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground">Team Management Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will allow you to create teams, assign managers, add members, and set team-specific permissions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TeamManagementPage;