import React from 'react';
import { Link } from 'react-router-dom';

const LandingPageFooter = () => {
  return (
    <footer className="py-12 bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-4 text-center text-white">
        <div className="mb-8 flex flex-col items-center">
          <h3 className="text-xl font-semibold text-white mb-2">Work Suite Pro</h3>
          <p className="text-sm max-w-md mx-auto text-white">
            An intuitive, dynamic desktop interface for effective scheduling, resource management, and data analytics—designed to help you optimize your workflows.
          </p>
        </div>
        <div className="flex justify-center space-x-6 mb-8">
          <a href="#who-we-are" className="hover:text-sky-300 transition-colors text-white">Who We Are</a>
          <a href="#what-we-do" className="hover:text-sky-300 transition-colors text-white">What We Do</a>
          <Link to="/information#privacy-policy" className="hover:text-sky-300 transition-colors text-white">Privacy Policy</Link>
          <Link to="/information#terms-of-service" className="hover:text-sky-300 transition-colors text-white">Terms of Service</Link>
        </div>
        <p className="text-sm text-white">&copy; {new Date().getFullYear()} Work Suite Pro. All rights reserved.</p>
        <p className="text-xs mt-2 text-white">Built with passion by our innovative team.</p>
      </div>
    </footer>
  );
};

export default LandingPageFooter;