import { faker } from '@faker-js/faker';
import { supabase, batchInsert, REGION_NAMES } from '@/../scripts/seed-utils.js';

export async function seedRegions(count, progressCallback = () => {}) {
  progressCallback(`Starting to seed regions. Requested count: ${count}. Available unique names: ${REGION_NAMES.length}.`);

  progressCallback('Fetching existing region names to avoid duplicates...');
  const { data: existingRegions, error: fetchError } = await supabase
    .from('regions')
    .select('regionname');

  if (fetchError) {
    progressCallback(`Warning: Could not fetch existing region names. ${fetchError.message}`);
  }

  const existingRegionNames = new Set(existingRegions ? existingRegions.map(r => r.regionname) : []);
  progressCallback(`Found ${existingRegionNames.size} existing region names.`);

  const regionsToInsert = [];
  const regionNamesToGenerate = REGION_NAMES.slice(0, count);

  for (const regionName of regionNamesToGenerate) {
    if (!existingRegionNames.has(regionName)) {
      regionsToInsert.push({
        uid: faker.string.uuid(),
        regionname: regionName,
        description: faker.lorem.sentence(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      progressCallback(`Region name "${regionName}" already exists. Skipping.`);
    }
  }
  
  if (regionsToInsert.length > 0) {
    await batchInsert('regions', regionsToInsert, progressCallback);
  } else {
    progressCallback('No new unique regions to insert.');
  }
  
  progressCallback('Regions seeding process complete.');
  
  const { data: seededRegions, error: postInsertFetchError } = await supabase.from('regions').select('regionid, uid, regionname');
  if (postInsertFetchError) {
    progressCallback(`Error fetching seeded regions after insert: ${postInsertFetchError.message}`);
    console.error("Error fetching seeded regions after insert:", postInsertFetchError);
    return [];
  }
  return seededRegions;
}