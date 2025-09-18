import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };
  
  const mockProfile = {
      fullname: 'Guest User',
      username: 'guest_user',
      email: 'guest@example.com',
      avatar_url: '',
      role: 'Admin',
      activeSubscription: {
        plan: { name: 'Pro' },
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      updated_at: new Date().toISOString()
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-4xl py-8 px-4"
    >
      <Card className="shadow-xl bg-card-themed border-card-themed">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/50 shadow-lg">
                <AvatarImage src={mockProfile.avatar_url} alt={mockProfile.fullname} />
                <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                  {getInitials(mockProfile.fullname)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-grow text-center sm:text-left">
              <CardTitle className="text-3xl font-bold text-foreground">{mockProfile.fullname}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">{mockProfile.username}</CardDescription>
              <div className="mt-3 flex items-center justify-center sm:justify-start space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{mockProfile.email}</span>
              </div>
               {mockProfile.activeSubscription && (
                <div className="mt-2 flex items-center justify-center sm:justify-start space-x-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  <span className="font-semibold text-green-400">
                    {mockProfile.activeSubscription.plan.name} Plan
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon={<User className="h-5 w-5 text-primary" />} title="Full Name" value={mockProfile.fullname} />
                <InfoCard icon={<User className="h-5 w-5 text-primary" />} title="Username" value={mockProfile.username} />
                <InfoCard icon={<Mail className="h-5 w-5 text-primary" />} title="Email" value={mockProfile.email} />
                <InfoCard icon={<Briefcase className="h-5 w-5 text-primary" />} title="Role" value={mockProfile.role} />
              </div>
              
              {mockProfile.activeSubscription ? (
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Subscription Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard icon={<ShieldCheck className="h-5 w-5 text-primary" />} title="Current Plan" value={mockProfile.activeSubscription.plan.name} />
                    <InfoCard icon={<User className="h-5 w-5 text-primary" />} title="Status" value={mockProfile.activeSubscription.status} className="capitalize" />
                  </div>
                   <Button onClick={() => navigate('/pricing')} className="mt-6 btn-secondary-themed">
                    View Pricing
                  </Button>
                </div>
              ) : (
                 <div className="mt-6 p-4 bg-card-alt-themed rounded-lg border border-border text-center">
                    <p className="text-muted-foreground mb-3">You are currently not subscribed to any plan.</p>
                    <Button onClick={() => navigate('/pricing')} className="btn-primary-themed">
                        View Pricing Plans
                    </Button>
                </div>
              )}
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const InfoCard = ({ icon, title, value, className = "" }) => (
  <div className="p-4 bg-card-alt-themed rounded-lg border border-border">
    <div className="flex items-center space-x-3 mb-1">
      {icon}
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
    </div>
    <p className={cn("text-md font-semibold text-foreground truncate", className)}>{value}</p>
  </div>
);

export default ProfilePage;