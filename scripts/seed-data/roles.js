import { faker } from '@faker-js/faker';
import { supabase, batchInsert, ROLE_DESCRIPTIONS_APP, ROLE_SCOPES, ROLE_CATEGORIES, CLEARANCE_LEVELS } from '@/../scripts/seed-utils.js';

export async function seedRoles(rolesToSeed, progressCallback = () => {}) {
  progressCallback(`Starting to seed ${rolesToSeed.length} roles...`);
  const rolesData = [];
  for (const roleName of rolesToSeed) {
    rolesData.push({
      uid: faker.string.uuid(),
      rolename: roleName,
      description: ROLE_DESCRIPTIONS_APP[roleName] || faker.lorem.sentence(),
      permissions: { view: true, edit: faker.datatype.boolean(), delete: faker.datatype.boolean(0.1) },
      status: 'Active',
      role_scope: faker.helpers.arrayElement(ROLE_SCOPES),
      role_category: faker.helpers.arrayElement(ROLE_CATEGORIES),
      clearance_level: faker.helpers.arrayElement(CLEARANCE_LEVELS),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  await batchInsert('roles', rolesData, progressCallback);
  progressCallback('Roles seeding complete.');
  
  const { data: seededRoles, error } = await supabase.from('roles').select('roleid, uid, rolename');
  if (error) {
    progressCallback(`Error fetching seeded roles: ${error.message}`);
    console.error("Error fetching seeded roles:", error);
    return [];
  }
  return seededRoles;
}