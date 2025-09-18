import { faker } from '@faker-js/faker';
import { supabase, batchInsert, RANKS, ROLES_PERSONNEL, CLEARANCE_LEVELS, DEPARTMENTS, EMPLOYMENT_CATEGORIES, CERTIFICATION_STATUSES } from '@/../scripts/seed-utils.js';

export async function seedPersonnel(count = 200, progressCallback = () => {}) {
  return new Promise(async (resolve, reject) => {
    try {
      progressCallback(`Starting to seed ${count} personnel records...`);
      const personnelData = [];
      const existingPersonnelUuids = new Set();

      progressCallback('Fetching existing personnel UUIDs to avoid duplicates...');
      const { data: existingData, error: fetchError } = await supabase
        .from('personnel')
        .select('personnel_uuid');

      if (fetchError) {
        console.error('Error fetching existing personnel UUIDs:', fetchError.message);
        progressCallback(`Warning: Could not fetch existing UUIDs for personnel. ${fetchError.message}`);
      } else if (existingData) {
        existingData.forEach(p => existingPersonnelUuids.add(p.personnel_uuid));
        progressCallback(`Found ${existingPersonnelUuids.size} existing personnel records. Will skip these UUIDs.`);
      }

      for (let i = 0; i < count; i++) {
        let personnel_uuid = faker.string.uuid();
        while (personnelData.some(p => p.personnel_uuid === personnel_uuid) || existingPersonnelUuids.has(personnel_uuid)) {
          personnel_uuid = faker.string.uuid();
        }

        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;

        personnelData.push({
          personnel_uuid: personnel_uuid,
          auth_userid: faker.string.uuid(), 
          name: fullName,
          rank: faker.helpers.arrayElement(RANKS),
          role: faker.helpers.arrayElement(ROLES_PERSONNEL),
          clearance_level: faker.helpers.arrayElement(CLEARANCE_LEVELS),
          datejoined: faker.date.past({ years: 10 }),
          activestatus: faker.datatype.boolean(0.85),
          contactinfo: faker.phone.number(),
          employment_category: faker.helpers.arrayElement(EMPLOYMENT_CATEGORIES),
          department: faker.helpers.arrayElement(DEPARTMENTS),
          avatar_url: faker.image.avatarGitHub(),
          certificationstatus: faker.helpers.arrayElement(CERTIFICATION_STATUSES),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if ((i + 1) % 50 === 0 || i + 1 === count) {
            progressCallback(`Generated ${i + 1}/${count} personnel records...`);
        }
      }
      progressCallback(`Finished generating ${personnelData.length} new personnel records.`);
      
      await batchInsert('personnel', personnelData, progressCallback);

      progressCallback('Personnel seeding complete.');
      resolve('Personnel seeding complete.');
    } catch (error) {
      console.error('Personnel seeding script failed:', error);
      progressCallback(`Personnel seeding script failed: ${error.message}`);
      reject(error);
    }
  });
}