import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const HelpAccordion = () => {
  return (
    <Accordion type="single" collapsible className="w-full bg-slate-850/70 p-4 rounded-lg border border-slate-700">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-slate-300 hover:text-sky-400 text-sm">
          <div className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" /> How to Use This Page
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-slate-400 text-xs space-y-2 pt-3">
          <p><strong>1. Select a Table:</strong> Use the "Select Table" dropdown to choose a table from your database.</p>
          <p><strong>2. View Table Structure:</strong> Once a table is selected, its structure (columns and types) will be displayed on the left panel if available.</p>
          <p><strong>3. Build Your Query:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Filter Builder Tab:</strong> Add filters by clicking "Add Filter". Select a column, operator, and enter a value. This builds a SQL query for you.</li>
            <li><strong>Custom SQL Tab:</strong> Write your own SQL queries directly. Use standard SQL syntax.</li>
          </ul>
          <p><strong>4. Set Options:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Limit:</strong> Maximum number of rows to return.</li>
            <li><strong>Offset:</strong> Number of rows to skip (for pagination).</li>
            <li><strong>Order By (Filter Builder only):</strong> Select a column to sort results by and choose ascending (ASC) or descending (DESC) order.</li>
          </ul>
          <p><strong>5. Run Query:</strong> Click the "Run Query" button. Results will appear in the "Query Results" card below.</p>
          <p><strong>6. Query History & Saved Queries:</strong> Access your recent queries or save frequently used ones for quick access using the buttons below the main query execution button.</p>
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>For 'contains', 'starts_with', 'ends_with' operators, the value is typically a string.</li>
            <li>'Is Null' and 'Is Not Null' operators do not require a value.</li>
            <li>Custom SQL provides full control but requires SQL knowledge. Ensure your queries are safe and efficient.</li>
            <li>The system uses `ILIKE` for string comparisons in the filter builder, making them case-insensitive.</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default HelpAccordion;