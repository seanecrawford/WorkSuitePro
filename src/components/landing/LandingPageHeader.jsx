import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react'; 

const LandingPageHeader = () => {
  const navigate = useNavigate();
  
  const handleStartHere = () => {
    navigate('/dashboard'); 
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-20 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-xl font-bold text-white hover:text-sky-300 transition-colors">Work Suite Pro</Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#who-we-are" className="text-white hover:text-sky-300 transition-colors">Who We Are</a>
          <a href="#what-we-do" className="text-white hover:text-sky-300 transition-colors">What We Do</a>
          <Link to="/academy" className="flex items-center text-white hover:text-sky-300 transition-colors">
            <BookOpen className="mr-1.5 h-4 w-4" /> Academy
          </Link>
          <Link to="/pricing" className="text-white hover:text-sky-300 transition-colors">Pricing</Link>
          <Link to="/information#privacy-policy" className="text-white hover:text-sky-300 transition-colors">Privacy</Link>
          
          <Button onClick={handleStartHere} className="bg-sky-500 hover:bg-sky-600 text-white">
            Go to App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </nav>
        <div className="md:hidden flex items-center space-x-2">
           <Button onClick={() => navigate('/academy')} size="sm" variant="ghost" className="text-white hover:bg-sky-500/20">
            <BookOpen className="h-5 w-5" />
          </Button>
          <Button onClick={handleStartHere} size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
            Dashboard
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LandingPageHeader;