import { faker } from '@faker-js/faker';
import { supabase, batchInsert, COMPANY_INDUSTRIES } from '@/../scripts/seed-utils.js';

export async function seedCompanies(count, progressCallback = () => {}) {
  progressCallback(`Starting to seed companies. Requested count: ${count}.`);

  progressCallback('Fetching existing company names to avoid duplicates...');
  const { data: existingCompanies, error: fetchError } = await supabase
    .from('companies')
    .select('companyname');

  if (fetchError) {
    progressCallback(`Warning: Could not fetch existing company names. ${fetchError.message}`);
    // Continue even if fetch fails, as the table might be empty or just created.
  }

  const existingCompanyNames = new Set(existingCompanies ? existingCompanies.map(c => c.companyname) : []);
  progressCallback(`Found ${existingCompanyNames.size} existing company names.`);

  const companiesToInsert = [];
  const generatedCompanyNamesThisRun = new Set();
  let attempts = 0;
  const maxAttempts = count * 2; // Allow some leeway for generating unique names

  while (companiesToInsert.length < count && attempts < maxAttempts) {
    attempts++;
    const companyName = `${faker.company.name()} ${faker.company.buzzVerb()}`;

    if (!existingCompanyNames.has(companyName) && !generatedCompanyNamesThisRun.has(companyName)) {
      companiesToInsert.push({
        company_uid: faker.string.uuid(),
        companyname: companyName,
        industry: faker.helpers.arrayElement(COMPANY_INDUSTRIES),
        address: faker.location.streetAddress(true),
        contact_email: faker.internet.email(),
        contact_phone: faker.phone.number(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      generatedCompanyNamesThisRun.add(companyName);
    }
  }

  if (companiesToInsert.length < count) {
    progressCallback(`Warning: Could only generate ${companiesToInsert.length} unique companies out of ${count} requested after ${maxAttempts} attempts.`);
  }

  if (companiesToInsert.length > 0) {
    await batchInsert('companies', companiesToInsert, progressCallback);
  } else {
    progressCallback('No new unique companies to insert.');
  }
  
  progressCallback('Companies seeding process complete.');

  const { data: seededCompanies, error: postInsertFetchError } = await supabase.from('companies').select('companyid, company_uid');
  if (postInsertFetchError) {
    progressCallback(`Error fetching seeded companies after insert: ${postInsertFetchError.message}`);
    console.error("Error fetching seeded companies after insert:", postInsertFetchError);
    return [];
  }
  return seededCompanies;
}