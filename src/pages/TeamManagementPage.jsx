import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, FileText, CheckCircle, TrendingUp, AlertCircle, ShoppingCart, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const mockTeams = [
  { 
    id: 1, 
    name: 'Core Development', 
    manager: 'Alice Johnson', 
    memberCount: 8,
    members: [
      { name: 'Alice Johnson', role: 'Manager', avatar: '/avatars/01.png' },
      { name: 'Bob Williams', role: 'Lead Dev', avatar: '/avatars/02.png' },
      { name: 'Charlie Brown', role: 'FE Dev', avatar: '/avatars/03.png' },
    ]
  },
  { 
    id: 2, 
    name: 'Product & Design', 
    manager: 'David Smith', 
    memberCount: 5,
    members: [
      { name: 'David Smith', role: 'Manager', avatar: '/avatars/04.png' },
      { name: 'Eve Davis', role: 'UI/UX Lead', avatar: '/avatars/05.png' },
    ]
  },
  { 
    id: 3, 
    name: 'Marketing & Sales', 
    manager: 'Frank Miller', 
    memberCount: 12,
    members: [
      { name: 'Frank Miller', role: 'Manager', avatar: '/avatars/01.png' },
    ]
  },
];

const TeamCard = ({ team }) => (
  <Card className="bg-card-alt-themed shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-primary">{team.name}</CardTitle>
      <CardDescription>Managed by {team.manager}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Members</span>
        <span className="font-bold text-foreground">{team.memberCount}</span>
      </div>
      <div className="flex -space-x-2 overflow-hidden mt-4">
        {team.members.map((member, index) => (
          <Avatar key={index} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
            <AvatarImage src={`https://i.pravatar.cc/40?u=${member.name}`} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
       <Button variant="secondary" className="w-full mt-4">View Team</Button>
    </CardContent>
  </Card>
);

const TeamManagementPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Management</h1>
          <p className="text-muted-foreground">
            This is a placeholder for the future Team Management page. All data is for demonstration.
          </p>
        </div>
        <Button className="btn-primary-themed">
          <UserPlus className="mr-2 h-4 w-4" /> Create New Team
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTeams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mt-8 mb-4">Team Analytics (Placeholder)</h2>
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Overview</CardTitle>
            <CardDescription>Charts and metrics related to team productivity will be displayed here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground p-8">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p>Team analytics will be implemented here.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TeamManagementPage;