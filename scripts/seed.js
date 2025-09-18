import { supabase as anonSupabase, REGION_NAMES, ALL_APP_ROLES } from './seed-utils.js';
import { createClient } from '@supabase/supabase-js';
import { seedPersonnel } from './seed-data/personnel.js';
import { seedRegions } from './seed-data/regions.js';
import { seedFocusCenters } from './seed-data/focusCenters.js';
import { seedCompanies } from './seed-data/companies.js';
import { seedRoles } from './seed-data/roles.js';
import { seedProjects } from './seed-data/projects.js';
import { seedFinancialPerformance } from './seed-data/financialPerformance.js';
import { seedExpenses } from './seed-data/expenses.js';
import { seedFinancialForecasts } from './seed-data/financialForecasts.js';
import { seedRevenueStreams } from './seed-data/revenueStreams.js';
import { seedMilestones } from './seed-data/milestones.js';
import { seedProjectTasks } from './seed-data/projectTasks.js';
import { seedChatGroups, seedChatMessages } from './seed-data/chatMessages.js';
import { seedKanbanColumns, seedKanbanTasks } from './seed-data/kanban.js';
import { seedInventoryData } from './seed-data/inventory.js'; 
import { seedKnowledgeBaseCategories, seedKnowledgeBaseArticles } from './seed-data/knowledgeBase.js';
import { seedHrSuiteData } from './seed-data/hrSpecificData.js';
import { seedMaintenanceData } from './seed-data/maintenance.js';
import { seedCrmData } from './seed-data/crm.js';

export async function fetchAllUsers(progressCallback) {
  progressCallback("Attempting to fetch authenticated users...");
  
  const isNodeEnvironment = typeof process !== 'undefined' && process.env && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL;

  if (isNodeEnvironment) {
    progressCallback("Service role key and URL detected (Node.js environment assumed). Using admin client for user list.");
    const supabaseAdminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    try {
      const { data: { users }, error } = await supabaseAdminClient.auth.admin.listUsers();
      if (error) {
        progressCallback(`Error fetching users with admin client: ${error.message}. Falling back to current user.`);
        const { data: { user: currentUser } } = await anonSupabase.auth.getUser();
        return currentUser ? [currentUser] : [];
      }
      progressCallback(`Fetched ${users.length} users using admin client.`);
      return Array.isArray(users) ? users : (users ? [users] : []);
    } catch (e) {
      progressCallback(`Exception fetching users with admin client: ${e.message}. Falling back to current user.`);
      const { data: { user: currentUser } } = await anonSupabase.auth.getUser();
      return currentUser ? [currentUser] : [];
    }
  } else {
    progressCallback("Not in Node.js environment or service role key/URL not available. Fetching current user only (if any) using anon key.");
    const { data: { user }, error } = await anonSupabase.auth.getUser();
    if (error) {
      progressCallback(`Error fetching current user: ${error.message}. No users will be available for seeding user-specific fields.`);
      return [];
    }
    if (user) {
      progressCallback(`Fetched current authenticated user: ${user.email}.`);
      return [user]; 
    }
    progressCallback("No authenticated user found with anon client. User-specific fields may not be seeded or will use placeholders.");
    return [];
  }
}

export async function seedChatDataOnly(progressCallback = () => {}) {
  try {
    progressCallback("--- Starting Chat Data Seeding Only ---");
    let authUsers = await fetchAllUsers(progressCallback);
    authUsers = Array.isArray(authUsers) ? authUsers : [];
    
    progressCallback("Fetching projects for chat group context (optional)...");
    const { data: seededProjectsList, error: projectsError } = await anonSupabase
      .from('projects')
      .select('projectid'); 
    
    if (projectsError) {
      progressCallback(`Warning: Could not fetch projects. Chat groups may not be linked to projects. Error: ${projectsError.message}`);
    }
    
    const seededChatGroups = await seedChatGroups(5, seededProjectsList || [], authUsers, progressCallback); 
    if (seededChatGroups.length > 0) {
      await seedChatMessages(5, seededChatGroups, authUsers, progressCallback); 
    } else {
      progressCallback("Skipping chat messages seeding as no chat groups were created/returned.");
    }
    progressCallback("--- Chat Data Seeding Complete ---");
    return "Chat data seeding process finished.";
  } catch (error) {
    console.error("Chat data seeding failed:", error);
    progressCallback(`Chat data seeding failed: ${error.message}`);
    throw error;
  }
}


export async function seedCoreData(progressCallback = () => {}) {
  try {
    progressCallback("--- Starting Core Data Seeding ---");

    let authUsers = await fetchAllUsers(progressCallback);
    authUsers = Array.isArray(authUsers) ? authUsers : [];
    if (authUsers.length === 0) {
      progressCallback("Warning: No authenticated users found. Some data requiring user IDs (like chat, KB articles, CRM owners) will be skipped or limited.");
    }

    await seedPersonnel(50, progressCallback); 

    progressCallback("Fetching personnel for assignments...");
    const { data: personnelList, error: personnelError } = await anonSupabase
      .from('personnel')
      .select('personnel_uuid, name'); 

    if (personnelError || !personnelList || personnelList.length === 0) {
      progressCallback(`Warning: Could not fetch personnel or personnel list is empty. Some assignments may be skipped. Error: ${personnelError?.message}`);
    }
    const personnelUuids = personnelList ? personnelList.map(p => p.personnel_uuid) : [];
    
    const seededRegions = await seedRegions(REGION_NAMES.length, progressCallback);
    if (!seededRegions || seededRegions.length === 0) {
        progressCallback("Critical: No regions were seeded or fetched. Aborting further seeding that depends on regions.");
        throw new Error("Region seeding failed or returned empty, cannot proceed.");
    }
    
    const seededFocusCenters = await seedFocusCenters(5, seededRegions, progressCallback); 
    if (!seededFocusCenters || seededFocusCenters.length === 0) {
        progressCallback("Warning: No focus centers were seeded. Dependent data might be affected.");
    }

    const seededCompanies = await seedCompanies(10, progressCallback); 
    if (!seededCompanies || seededCompanies.length === 0) {
        progressCallback("Critical: No companies were seeded or fetched. Aborting further seeding that depends on companies.");
        throw new Error("Company seeding failed or returned empty, cannot proceed.");
    }
    
    await seedRoles(ALL_APP_ROLES, progressCallback);
    
    await seedProjects(20, seededCompanies, seededRegions, seededFocusCenters, personnelUuids, progressCallback); 
    const { data: seededProjectsList, error: projectsError } = await anonSupabase
      .from('projects')
      .select('projectid, companyid, regionid, focuscenterid, startdate, enddate, new_projectid');
    
    if (projectsError || !seededProjectsList || seededProjectsList.length === 0) {
        progressCallback(`Warning: Could not fetch seeded projects or project list is empty. Dependent data might be affected. Error: ${projectsError?.message}`);
    }

    if (seededProjectsList?.length > 0 && seededCompanies?.length > 0) {
      await seedFinancialPerformance(15, seededCompanies, seededProjectsList, seededRegions, seededFocusCenters, progressCallback); 
      await seedExpenses(50, seededProjectsList, seededCompanies, personnelList || [], progressCallback); 
      await seedFinancialForecasts(20, seededProjectsList, seededCompanies, progressCallback); 
      await seedRevenueStreams(15, seededProjectsList, seededCompanies, progressCallback); 
    } else {
      progressCallback("Skipping some financial data seeding due to missing project or company data.");
    }

    let seededMilestonesList = [];
    if (seededProjectsList?.length > 0) {
      seededMilestonesList = await seedMilestones(2, seededProjectsList, progressCallback); 
      if (!seededMilestonesList || seededMilestonesList.length === 0) {
        progressCallback("Warning: Milestone seeding returned empty. Dependent data might be affected.");
      }
    } else {
      progressCallback("Skipping milestone seeding due to missing project data.");
    }

    let seededProjectTasksList = [];
    if (seededMilestonesList?.length > 0 && personnelList?.length > 0) {
      seededProjectTasksList = await seedProjectTasks(3, seededMilestonesList, personnelList, progressCallback); 
       if (!seededProjectTasksList || seededProjectTasksList.length === 0) {
        progressCallback("Warning: Project task seeding returned empty. Dependent data might be affected.");
      }
    } else {
      progressCallback("Skipping project task seeding due to missing milestone or personnel data.");
    }

    if (authUsers.length > 0 && seededProjectsList?.length > 0) {
      const seededChatGroups = await seedChatGroups(5, seededProjectsList, authUsers, progressCallback); 
      if (seededChatGroups.length > 0) {
        await seedChatMessages(5, seededChatGroups, authUsers, progressCallback); 
      } else {
        progressCallback("Skipping chat messages seeding as no chat groups were created/returned.");
      }
    } else {
      progressCallback("Skipping chat groups and messages seeding due to missing authenticated users or projects.");
    }
    
    if (seededProjectsList?.length > 0 || authUsers?.length > 0) {
        const seededKanbanColumns = await seedKanbanColumns(seededProjectsList, authUsers, progressCallback); 
        if (seededKanbanColumns.length > 0) {
            await seedKanbanTasks(3, seededKanbanColumns, personnelList || [], seededProjectTasksList || [], progressCallback); 
        } else {
            progressCallback("Skipping Kanban tasks seeding as no Kanban columns were created.");
        }
    } else {
         progressCallback("Skipping Kanban columns and tasks seeding due to missing projects or users.");
    }

    if (authUsers.length > 0) {
      const seededKBCategories = await seedKnowledgeBaseCategories(progressCallback);
      if (seededKBCategories.length > 0) {
        await seedKnowledgeBaseArticles(3, seededKBCategories, authUsers, progressCallback); 
      } else {
        progressCallback("Skipping KB articles seeding as no KB categories were created/returned.");
      }
    } else {
      progressCallback("Skipping Knowledge Base seeding due to missing authenticated users.");
    }

    await seedInventoryData(progressCallback);
    await seedHrSuiteData(progressCallback);
    await seedMaintenanceData(progressCallback);
    await seedCrmData(authUsers, progressCallback);

    progressCallback("--- Core Data Seeding Complete ---");
    return "Core data seeding process finished. Note: User-specific fields might be limited if run from client without admin rights.";

  } catch (error) {
    console.error("Core data seeding failed:", error);
    progressCallback(`Core data seeding failed: ${error.message}`);
    throw error;
  }
}

export { seedHrSuiteData, seedMaintenanceData, seedCrmData };

if (typeof process !== 'undefined' && require.main === module) {
  seedCoreData((message) => console.log(message))
    .then(() => console.log("Seeding script finished successfully."))
    .catch((err) => console.error("Seeding script failed:", err));
}