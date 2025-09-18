import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Using the Supabase client credentials provided by the system
const SUPABASE_URL = 'https://kgzvjkuxhhanomuzjyfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnenZqa3V4aGhhbm9tdXpqeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTI5NzYsImV4cCI6MjA2MzA4ODk3Nn0.D0mZV1SFSUKeg5-NOqkLvhdPnamHBc1VqOCGfqFMwjw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedDefenseRoles(progressCallback = console.log) {
  let roles = [
    { role_name: 'defense_admin', description: 'System Administrator (Defense)' },
    { role_name: 'defense_project_manager', description: 'Manages defense projects (Defense)' },
    { role_name: 'defense_engineer', description: 'Provides engineering solutions (Defense)' },
    { role_name: 'defense_technician', description: 'Technical maintenance and support (Defense)' },
    { role_name: 'defense_contractor', description: 'External specialized personnel (Defense)' }
  ];
  progressCallback('Seeding Defense Roles...');
  for (let r of roles) {
    let { data, error } = await supabase.from('defense_roles').upsert(r, { onConflict: 'role_name', ignoreDuplicates: false });
    if (error) {
      progressCallback(`Error inserting defense role: ${r.role_name} - ${error.message}`);
    } else {
      progressCallback(`Inserted/Upserted defense role: ${data && data.length > 0 ? data[0].role_name : r.role_name}`);
    }
  }
}

async function seedDefenseCompanies(progressCallback = console.log) {
  let companies = [
    { company_name: 'V2X Defense Solutions', description: 'Leading provider of defense contracting.' },
    { company_name: 'V2X Subsidiary A (Defense)', description: 'Handles logistics and supply chain for defense.' }
  ];
  progressCallback('Seeding Defense Companies...');
  for (let c of companies) {
    let { data, error } = await supabase.from('defense_companies').upsert(c, { onConflict: 'company_name', ignoreDuplicates: false });
    if (error) {
      progressCallback(`Error inserting defense company: ${c.company_name} - ${error.message}`);
    } else {
      progressCallback(`Inserted/Upserted defense company: ${data && data.length > 0 ? data[0].company_name : c.company_name}`);
    }
  }
}

async function seedDefenseProjects(num = 10, progressCallback = console.log) {
  progressCallback('Seeding Defense Projects...');
  let { data: companies, error: ce } = await supabase.from('defense_companies').select('id');
  if (ce || !companies || companies.length === 0) {
    progressCallback(`No defense companies found. Error: ${ce?.message || 'No companies'}. Cannot seed defense projects.`);
    return;
  }
  let projects = [];
  for (let i = 0; i < num; i++) {
    let comp = faker.helpers.arrayElement(companies);
    projects.push({
      project_name: `Defense Project ${faker.commerce.productName()} ${i + 1}`,
      description: faker.lorem.sentence(),
      defense_company_id: comp.id
    });
  }
  let { data, error } = await supabase.from('defense_projects').insert(projects);
  if (error) {
    progressCallback(`Error inserting defense projects: ${error.message}`);
  } else {
    progressCallback(`Inserted ${data ? data.length : 0} defense projects.`);
  }
}

async function seedDefenseEmployees(num = 50, progressCallback = console.log) { // Reduced for browser performance
  progressCallback('Seeding Defense Employees...');
  let { data: roles, error: re } = await supabase.from('defense_roles').select('id');
  if (re || !roles || roles.length === 0) {
    progressCallback(`No defense roles found. Error: ${re?.message || 'No roles'}. Cannot seed defense employees.`);
    return;
  }
  let employees = [];
  for (let i = 0; i < num; i++) {
    let r = faker.helpers.arrayElement(roles);
    employees.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase() + `_defense_${i}`, // Ensure unique emails
      phone: faker.phone.number(),
      defense_role_id: r.id,
      department: faker.commerce.department(),
      join_date: faker.date.past({ years: 10 })
    });
  }

  const batchSize = 25; // Smaller batch size for browser
  for (let i = 0; i < employees.length; i += batchSize) {
    const batch = employees.slice(i, i + batchSize);
    progressCallback(`Inserting defense employee batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(employees.length/batchSize)}...`);
    const { data, error } = await supabase.from('defense_employees').insert(batch);
    if (error) {
      progressCallback(`Error inserting defense employees batch: ${error.message}`);
      // Optionally stop or continue with other batches
    } else {
      progressCallback(`Inserted batch of ${data ? data.length : 0} defense employees.`);
    }
  }
  progressCallback(`Finished inserting defense employees. Total attempted: ${employees.length}.`);
}

export async function seedDefenseDataSuite(progressCallback = console.log) {
  try {
    progressCallback("--- Starting V2X Defense Data Seeding Suite ---");
    await seedDefenseRoles(progressCallback);
    await seedDefenseCompanies(progressCallback);
    await seedDefenseProjects(10, progressCallback);
    await seedDefenseEmployees(50, progressCallback); // Keep count manageable for client-side
    progressCallback("--- V2X Defense Data Seeding Suite Complete ---");
    return "V2X Defense data seeding process finished.";
  } catch (error) {
    progressCallback(`V2X Defense data seeding failed: ${error.message}`);
    console.error("V2X Defense data seeding error:", error);
    throw error;
  }
}

// For direct Node.js execution (testing)
if (typeof process !== 'undefined' && require.main === module) {
  seedDefenseDataSuite(console.log)
    .then(() => {
      console.log("Defense Seeding script finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Defense Seeding script failed:", err);
      process.exit(1);
    });
}