import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = profile?.role || 'Employee'; 

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
       <div className="flex items-center justify-center h-full p-8">
         <Alert variant="destructive" className="max-w-lg">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Access Denied</AlertTitle>
           <AlertDescription>
             You do not have permission to view this page. Your role is '{userRole}'. Allowed roles: {allowedRoles.join(', ')}.
           </AlertDescription>
         </Alert>
       </div>
    );
  }

  return children;
};

export default ProtectedRoute;