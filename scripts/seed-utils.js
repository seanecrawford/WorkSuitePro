import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgzvjkuxhhanomuzjyfj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnenZqa3V4aGhhbm9tdXpqeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTI5NzYsImV4cCI6MjA2MzA4ODk3Nn0.D0mZV1SFSUKeg5-NOqkLvhdPnamHBc1VqOCGfqFMwjw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const RANKS = ['Officer', 'Sergeant', 'Specialist', 'Corporal', 'Private', 'Recruit', 'Commander', 'Lieutenant'];
export const ROLES_PERSONNEL = ['Analyst', 'Engineer', 'Manager', 'Operator', 'Technician', 'Field Agent', 'Support Staff', 'Strategist', 'Director', 'Consultant', 'Administrator'];
export const CLEARANCE_LEVELS = ['Top Secret', 'Secret', 'Confidential', 'Restricted', 'Unclassified'];
export const DEPARTMENTS = ['Operations', 'Logistics', 'Intelligence', 'Engineering', 'Human Resources', 'Cybersecurity', 'Communications', 'Research & Development', 'Finance'];
export const EMPLOYMENT_CATEGORIES = ['Full-time', 'Part-time', 'Contractor', 'Intern'];
export const CERTIFICATION_STATUSES = ['Certified', 'Pending Certification', 'Expired', 'Not Applicable'];

export const REGION_NAMES = ["Aethelgard", "Baelhaven", "Cygnus Prime", "Drakon Major", "Elara Nebula", "Fenrir Sector", "Gorgon Cluster", "Hyperion Reach", "Iridium Belt", "Jotunheim Expanse"];
export const COMPANY_INDUSTRIES = ["Advanced Technology", "Logistics & Transport", "Heavy Manufacturing", "Scientific Research", "Defense & Security", "Resource Extraction", "Interstellar Trade"];
export const PROJECT_STATUSES = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled", "Pending Review", "Archived"];
export const PROJECT_PRIORITIES = ["Critical", "High", "Medium", "Low", "Deferred"];

export const ROLE_DESCRIPTIONS_APP = {
  'Analyst': 'Responsible for data analysis and intelligence gathering.',
  'Engineer': 'Designs, develops, and maintains systems and equipment.',
  'Manager': 'Oversees projects, teams, and operational units.',
  'Operator': 'Operates specialized machinery and systems.',
  'Technician': 'Provides technical support and maintenance.',
  'Field Agent': 'Conducts operations and missions in various locations.',
  'Support Staff': 'Provides administrative and logistical support.',
  'Strategist': 'Develops long-term plans and strategic initiatives.',
  'Director': 'Leads major departments or divisions.',
  'Consultant': 'Provides expert advice and specialized services.',
  'Administrator': 'Manages administrative tasks and database systems.'
};
export const ROLE_SCOPES = ['Global', 'Regional', 'Local', 'Project-Specific', 'Departmental'];
export const ROLE_CATEGORIES = ['Operational', 'Strategic', 'Support', 'Technical', 'Management'];
export const ALL_APP_ROLES = Object.keys(ROLE_DESCRIPTIONS_APP);

export const EXPENSE_CATEGORIES = ['Travel', 'Equipment', 'Software', 'Services', 'Training', 'Operational', 'Marketing', 'Salaries', 'Utilities'];
export const FORECAST_CONFIDENCE_LEVELS = ['High', 'Medium', 'Low', 'Speculative'];
export const REVENUE_STREAM_STATUSES = ['Active', 'Pending', 'Paused', 'Closed'];
export const MILESTONE_STATUSES = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Blocked'];
export const TASK_STATUSES = ['To Do', 'In Progress', 'Review', 'Blocked', 'Done', 'Cancelled'];
export const TASK_PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];

// Constants needed for hrSpecificData.js
export const EMPLOYMENT_STATUSES = ['Active', 'On Leave', 'Terminated', 'Pending Onboarding'];
export const LEAVE_TYPES = ['Vacation', 'Sick', 'Personal', 'Unpaid', 'Bereavement', 'Parental'];
export const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
export const PAYROLL_STATUSES = ['Pending', 'Processed', 'Paid', 'Failed'];
export const BENEFIT_TYPES = ['Health', 'Dental', 'Vision', 'Retirement', 'Life Insurance', 'Disability', 'Wellness Program', 'Other'];
export const DOCUMENT_TYPES = ['Contract', 'Policy', 'Form', 'Certificate', 'Review', 'Offer Letter', 'Handbook', 'Other'];


export async function batchInsert(tableName, data, progressCallback, batchSize = 50) {
  if (!data || data.length === 0) {
    progressCallback(`No new data to insert into ${tableName}.`);
    return;
  }
  progressCallback(`Attempting to insert ${data.length} new records into ${tableName} in batches of ${batchSize}...`);
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);
    if (error) {
      console.error(`Error inserting ${tableName} data (batch starting at index ${i}):`, error.message);
      progressCallback(`Error inserting ${tableName} batch: ${error.message}`);
      throw new Error(`Error inserting ${tableName} data: ${error.message}`);
    } else {
      progressCallback(`Successfully inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)} into ${tableName} (${batch.length} records).`);
    }
  }
}