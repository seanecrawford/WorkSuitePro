import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const SeedingProgress = ({ seedError, statusMessages }) => {
  if (!seedError && statusMessages.length <= 1 && !statusMessages.some(msg => msg.includes("initiated..."))) {
    // Only show initial "initiated" message or errors. Don't show if only one non-initiated message exists.
    // The goal is to avoid showing an empty box or a box with just one non-actionable message.
    // If statusMessages has more than one message, it means progress is happening.
     if (statusMessages.length === 1 && !statusMessages[0].includes("initiated...")) return null;
     if (statusMessages.length === 0) return null;

  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 border rounded-lg bg-slate-800/60 shadow-lg border-slate-700"
    >
      {seedError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 mb-3 bg-red-700/30 border border-red-600/50 rounded-md text-red-300"
        >
          <div className="flex items-center font-semibold">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Seeding Error
          </div>
          <p className="mt-1 text-sm">{seedError}</p>
        </motion.div>
      )}

      {statusMessages.length > 0 && (statusMessages.some(msg => msg.includes("initiated...")) || statusMessages.length > 1) && (
        <div>
          <h3 className="font-semibold text-slate-100 mb-2 text-md">Seeding Progress:</h3>
          <div className="max-h-60 overflow-y-auto p-2 bg-black/30 rounded scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
            <ul className="space-y-1.5 text-sm text-slate-300">
              {statusMessages.map((msg, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="whitespace-pre-wrap"
                >
                  {msg}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SeedingProgress;