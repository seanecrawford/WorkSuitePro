import { faker } from '@faker-js/faker';
import { supabase, batchInsert } from '@/../scripts/seed-utils.js';

export async function seedFocusCenters(count, regions, progressCallback = () => {}) {
  if (!regions || regions.length === 0) {
    progressCallback('Skipping Focus Centers: No regions provided. This is a critical dependency.');
    return []; // Return empty array if regions are missing
  }
  progressCallback(`Starting to seed ${count} focus centers...`);
  const focusCentersData = [];
  for (let i = 0; i < count; i++) {
    // Ensure there's always a region to pick from
    const selectedRegion = faker.helpers.arrayElement(regions); 
    if (!selectedRegion) {
        progressCallback(`Warning: Could not select a region for focus center ${i}. Skipping this center.`);
        continue;
    }

    focusCentersData.push({
      uid: faker.string.uuid(),
      centername: `Center ${faker.company.buzzNoun()} ${faker.location.city()}`,
      regionid: selectedRegion.regionid,
      description: faker.lorem.sentence(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (focusCentersData.length === 0) {
    progressCallback('No focus centers generated to seed, possibly due to missing regions earlier.');
    return [];
  }

  await batchInsert('focuscenters', focusCentersData, progressCallback);
  progressCallback('Focus Centers seeding complete.');

  const { data: seededFocusCenters, error } = await supabase.from('focuscenters').select('focuscenterid, uid, regionid');
   if (error) {
    progressCallback(`Error fetching seeded focus centers: ${error.message}`);
    console.error("Error fetching seeded focus centers:", error);
    return [];
  }
  return seededFocusCenters || []; // Ensure an array is always returned
}