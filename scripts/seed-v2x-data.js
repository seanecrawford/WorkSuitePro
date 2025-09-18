import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Using the Supabase client credentials provided by the system
const SUPABASE_URL = 'https://kgzvjkuxhhanomuzjyfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnenZqa3V4aGhhbm9tdXpqeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTI5NzYsImV4cCI6MjA2MzA4ODk3Nn0.D0mZV1SFSUKeg5-NOqkLvhdPnamHBc1VqOCGfqFMwjw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedV2XRoles(progressCallback = console.log) {
  const roles = [
    { role_name: 'v2x_admin', description: 'V2X System Administrator' },
    { role_name: 'v2x_operator', description: 'V2X Vehicle Operator' },
    { role_name: 'v2x_driver', description: 'V2X Vehicle Driver' },
    { role_name: 'v2x_passenger', description: 'V2X Vehicle Passenger' },
  ];

  progressCallback('Seeding V2X roles...');
  for (const role of roles) {
    const { data, error } = await supabase
      .from('v2x_roles')
      .upsert(role, { onConflict: 'role_name', ignoreDuplicates: false });
    if (error) {
      progressCallback(`Error inserting V2X role: ${role.role_name} - ${error.message}`);
    } else {
      progressCallback(`Inserted/Upserted V2X role: ${data && data.length > 0 ? data[0].role_name : role.role_name}`);
    }
  }
}

async function seedV2XVehicles(num = 20, progressCallback = console.log) { // Reduced for browser performance
  progressCallback('Seeding V2X vehicles...');
  const vehicles = [];
  for (let i = 0; i < num; i++) {
    vehicles.push({
      vehicle_name: faker.vehicle.vehicle(),
      license_plate: faker.vehicle.vrm() + i, // Ensure unique license plates for upsert/insert
      manufacturer: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past({ years: 10 }).getFullYear(),
      status: faker.helpers.arrayElement(['active', 'maintenance', 'inactive']),
    });
  }
  const { data, error } = await supabase.from('vehicles').insert(vehicles);
  if (error) {
    progressCallback(`Error inserting V2X vehicles: ${error.message}`);
  } else {
    progressCallback(`Inserted ${data ? data.length : 0} V2X vehicles.`);
  }
}

async function seedV2XDrivers(num = 30, progressCallback = console.log) { // Reduced for browser performance
  progressCallback('Seeding V2X drivers...');
  
  const { data: driverRoleData, error: roleError } = await supabase
    .from('v2x_roles')
    .select('id')
    .eq('role_name', 'v2x_driver')
    .maybeSingle(); // Use maybeSingle to handle 0 or 1 row without error

  if (roleError) {
    progressCallback(`Error fetching v2x_driver role id: ${roleError.message}`);
    return;
  }
  if (!driverRoleData) {
    progressCallback('v2x_driver role not found. Cannot seed V2X drivers.');
    return;
  }
  const driverRoleId = driverRoleData.id;

  const drivers = [];
  for (let i = 0; i < num; i++) {
    drivers.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase() + i, // Ensure unique emails
      phone: faker.phone.number(),
      v2x_role_id: driverRoleId,
    });
  }
  const { data, error } = await supabase.from('drivers').insert(drivers);
  if (error) {
    progressCallback(`Error inserting V2X drivers: ${error.message}`);
  } else {
    progressCallback(`Inserted ${data ? data.length : 0} V2X drivers.`);
  }
}

async function seedV2XMessages(num = 50, progressCallback = console.log) { // Reduced for browser performance
  progressCallback('Seeding V2X messages...');
  
  const { data: vehicles, error: vehicleError } = await supabase.from('vehicles').select('id');
  if (vehicleError || !vehicles || vehicles.length === 0) {
    progressCallback(`Error fetching V2X vehicles or no vehicles found: ${vehicleError?.message || 'No vehicles'}. Cannot seed V2X messages.`);
    return;
  }
  
  const { data: drivers, error: driverError } = await supabase.from('drivers').select('id');
  if (driverError || !drivers || drivers.length === 0) {
    progressCallback(`Error fetching V2X drivers or no drivers found: ${driverError?.message || 'No drivers'}. Cannot seed V2X messages.`);
    return;
  }

  const messages = [];
  for (let i = 0; i < num; i++) {
    const randomVehicle = faker.helpers.arrayElement(vehicles);
    const randomDriver = faker.helpers.arrayElement(drivers);
    messages.push({
      vehicle_id: randomVehicle.id,
      driver_id: randomDriver.id,
      message: faker.lorem.sentence(),
      timestamp: faker.date.recent(),
      message_type: faker.helpers.arrayElement(['status', 'alert', 'update']),
    });
  }
  const { data, error } = await supabase.from('v2x_messages').insert(messages);
  if (error) {
    progressCallback(`Error inserting V2X messages: ${error.message}`);
  } else {
    progressCallback(`Inserted ${data ? data.length : 0} V2X messages.`);
  }
}

export async function seedV2XData(progressCallback = console.log) {
  try {
    progressCallback("--- Starting V2X Data Seeding ---");
    await seedV2XRoles(progressCallback);
    await seedV2XVehicles(20, progressCallback);
    await seedV2XDrivers(30, progressCallback);
    await seedV2XMessages(50, progressCallback);
    progressCallback("--- V2X Data Seeding Complete ---");
    return "V2X data seeding process finished.";
  } catch (error) {
    progressCallback(`V2X data seeding failed: ${error.message}`);
    console.error("V2X data seeding error:", error);
    throw error;
  }
}

// For direct Node.js execution (testing)
if (typeof process !== 'undefined' && require.main === module) {
  seedV2XData(console.log)
    .then(() => {
      console.log("V2X Seeding script finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("V2X Seeding script failed:", err);
      process.exit(1);
    });
}