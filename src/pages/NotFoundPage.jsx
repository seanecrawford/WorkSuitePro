import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-card p-8 rounded-xl shadow-2xl max-w-md w-full"
      >
        <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold text-foreground mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;