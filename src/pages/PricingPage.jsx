import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(null); 
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        toast({ title: 'Error', description: 'Could not load pricing plans.', variant: 'destructive' });
      } else {
        setPlans(data);
      }
      setLoadingPlans(false);
    };
    fetchPlans();
  }, [toast]);

  const handleChoosePlan = async (plan) => {
    toast({
        title: "Feature Demonstration",
        description: "This is a demo. In a real application, this would redirect to a payment page.",
        variant: "default"
    });
    setLoadingCheckout(plan.id);
    setTimeout(() => {
        setLoadingCheckout(null);
        navigate('/dashboard');
    }, 1500);
  };
  
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (loadingPlans) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-background to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-foreground"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div variants={cardVariants} className="text-center mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-sky-400 to-teal-400">
            Choose Your Plan
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock powerful features and scale your operations with Work Suite Pro. Find the perfect plan for your needs.
          </p>
        </motion.div>

        {plans.length === 0 && !loadingPlans && (
          <motion.p variants={cardVariants} className="text-center text-muted-foreground text-lg">
            No subscription plans are currently available. Please check back later.
          </motion.p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div variants={cardVariants} key={plan.id}>
              <Card className={`flex flex-col h-full shadow-2xl rounded-xl border-2 transition-all duration-300 hover:shadow-[var(--theme-accent-primary)_0px_0px_30px_-5px]
                ${plan.name === 'Pro' ? 'border-primary ring-2 ring-primary' : 'border-border'}
                ${plan.name === 'Pro' ? 'bg-gradient-to-br from-primary/10 via-card to-card' : 'bg-card'}`}
              >
                <CardHeader className="p-6">
                  {plan.name === 'Pro' && (
                    <div className="absolute top-0 right-0 -mt-3 -mr-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide-xs bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
                        <Star className="w-4 h-4 mr-1.5" /> Most Popular
                      </span>
                    </div>
                  )}
                  <CardTitle className={`text-3xl font-bold ${plan.name === 'Pro' ? 'text-primary' : 'text-foreground'}`}>{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-6 space-y-6">
                  <div className="text-center">
                    <span className="text-5xl font-extrabold text-foreground">${plan.price}</span>
                    <span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {plan.features && Object.entries(plan.features).map(([key, value]) => (
                      <li key={key} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          <strong className="text-foreground capitalize">{key.replace(/_/g, ' ')}:</strong> {
                            typeof value === 'boolean' && value ? 'Included' :
                            typeof value === 'number' ? value :
                            value === 'unlimited' ? 'Unlimited' :
                            value
                          }
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 mt-auto">
                    <Button 
                      onClick={() => handleChoosePlan(plan)} 
                      className={`w-full text-lg py-3 ${plan.name === 'Pro' ? 'btn-primary-themed hover:shadow-primary/40' : 'btn-outline-themed hover:border-primary hover:text-primary'}`}
                      disabled={loadingCheckout === plan.id}
                    >
                      {loadingCheckout === plan.id ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        'Choose Plan'
                      )}
                    </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
         <motion.div variants={cardVariants} className="text-center mt-16">
            <p className="text-muted-foreground">
                Need a custom solution or have questions?{' '}
                <Link to="/contact" className="font-semibold text-primary hover:underline">Contact Sales</Link>
            </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PricingPage;