import React from 'react';
import { Wrench } from 'lucide-react';

const AdminHeader = ({ logoUrl }) => {
  return (
    <header className="pb-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <div className="flex items-center mb-2">
          {logoUrl && <img-replace src={logoUrl} alt="Work Suite Pro Logo" className="h-8 w-auto mr-3" />}
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center">
            <Wrench className="mr-3 h-8 w-8 text-sky-400" />
            Admin Development Tools
          </h1>
        </div>
        <p className="text-slate-400 mt-1">
          Utilities for development, data management, and administrative tasks for Work Suite Pro.
        </p>
      </div>
    </header>
  );
};

export default AdminHeader;