import { faker } from '@faker-js/faker';
import { supabase, batchInsert, PROJECT_STATUSES, PROJECT_PRIORITIES } from '@/../scripts/seed-utils.js';

export async function seedProjects(count, companies, regions, focusCenters, personnelUuids, progressCallback = () => {}) {
  if (!companies?.length) {
    progressCallback('Skipping Projects: Missing companies data. This is a critical dependency.');
    return;
  }
  if (!regions?.length) {
    progressCallback('Skipping Projects: Missing regions data. This is a critical dependency.');
    return;
  }
  if (!focusCenters?.length) {
    progressCallback('Skipping Projects: Missing focus centers data. This is a critical dependency.');
    return;
  }
  // personnelUuids can be empty, will be handled by assigning null

  progressCallback(`Starting to seed ${count} projects...`);
  
  const projectsData = [];
  const generatedProjectNamesThisRun = new Set();
  let attempts = 0;
  const maxAttempts = count * 2;

  while (projectsData.length < count && attempts < maxAttempts) {
    attempts++;
    const projectName = `Project ${faker.commerce.productName()} ${faker.hacker.verb()}`;

    if (!generatedProjectNamesThisRun.has(projectName)) {
      const startDate = faker.date.past({ years: 2 });
      const endDate = faker.date.future({ years: 3, refDate: startDate });
      
      const company = faker.helpers.arrayElement(companies);
      const region = faker.helpers.arrayElement(regions);
      const focusCenter = faker.helpers.arrayElement(focusCenters.filter(fc => fc.regionid === region.regionid) || focusCenters); // Prefer focus center in same region
      const projectManager = personnelUuids?.length > 0 ? faker.helpers.arrayElement(personnelUuids) : null;

      if(!company || !region || !focusCenter) {
        progressCallback(`Warning: Could not assign company, region or focus center for project attempt ${attempts}. Skipping this iteration.`);
        continue;
      }

      projectsData.push({
        new_projectid: faker.string.uuid(), 
        projectname: projectName,
        title: `Initiative: ${faker.company.catchPhrase()}`,
        description: faker.lorem.paragraphs(2),
        startdate: startDate.toISOString().split('T')[0],
        enddate: endDate.toISOString().split('T')[0],
        budget: faker.finance.amount({ min: 50000, max: 10000000, dec: 0 }),
        actual_cost: faker.finance.amount({ min: 0, max: 40000, dec: 0 }), // Initial actual cost low
        status: faker.helpers.arrayElement(PROJECT_STATUSES),
        priority: faker.helpers.arrayElement(PROJECT_PRIORITIES),
        regionid: region.regionid,
        focuscenterid: focusCenter.focuscenterid,
        companyid: company.companyid,
        project_manager_personnel_uuid: projectManager,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      generatedProjectNamesThisRun.add(projectName);
    }
  }

  if (projectsData.length < count) {
    progressCallback(`Warning: Could only generate ${projectsData.length} unique project names out of ${count} requested after ${maxAttempts} attempts.`);
  }
  
  if (projectsData.length > 0) {
    await batchInsert('projects', projectsData, progressCallback);
  } else {
    progressCallback('No new unique projects to insert.');
  }
  
  progressCallback('Projects seeding complete.');
  // No need to return project data from here, seedCoreData will fetch it
}