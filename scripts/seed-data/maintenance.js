import { faker } from '@faker-js/faker';
import { batchInsert, supabase } from '../seed-utils.js';
import { format, addDays, subDays } from 'date-fns';

const EQUIPMENT_TYPES = ['HVAC Unit', 'Pump', 'Generator', 'Compressor', 'Vehicle', 'Forklift', 'Conveyor Belt', 'Robotic Arm', 'CNC Machine', 'Server Rack', 'Network Switch', 'Security Camera', 'Excavator', 'Bulldozer', 'Crane', 'Welding Machine', '3D Printer', 'Spectrometer'];
const EQUIPMENT_STATUSES = ['Operational', 'Needs Repair', 'Under Maintenance', 'Decommissioned', 'Awaiting Parts', 'Scheduled for Inspection'];
const LOCATIONS = ['North Wing - Section A', 'South Wing - Section B', 'Rooftop Utility Area', 'Basement Mechanical Room', 'Warehouse Bay 1', 'Production Line 3', 'Data Center - Rack 5', 'Loading Dock 2', 'Office Block - Floor 3', 'Field Site Alpha', 'Mobile Unit 7', 'Research Lab Omega'];
const WORK_ORDER_STATUSES = ['Open', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Awaiting Parts'];
const WORK_ORDER_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export async function seedWorkOrders(equipmentList, personnelList, userList, count = 50, progressCallback = () => {}) {
  progressCallback(`--- Seeding Work Orders (Count: ${count}) ---`);
  if (!equipmentList || equipmentList.length === 0) {
    progressCallback("No equipment provided. Skipping work order seeding.");
    return [];
  }

  const workOrders = [];
  for (let i = 0; i < count; i++) {
    const equipment = faker.helpers.arrayElement(equipmentList);
    const reportedDate = faker.date.past({ years: 1 });
    const status = faker.helpers.arrayElement(WORK_ORDER_STATUSES);
    let completionDate = null;
    if (status === 'Completed') {
      completionDate = faker.date.between({ from: reportedDate, to: new Date() });
    }

    workOrders.push({
      equipment_uid: equipment.equipment_uid,
      title: `Work Order for ${equipment.equipmentname} - ${faker.lorem.words(3)}`,
      description: faker.lorem.paragraph(),
      status: status,
      priority: faker.helpers.arrayElement(WORK_ORDER_PRIORITIES),
      assigned_to_personnel_id: (personnelList && personnelList.length > 0) ? faker.helpers.arrayElement(personnelList).personnel_uuid : null,
      reported_by_user_id: (userList && userList.length > 0) ? faker.helpers.arrayElement(userList).id : null,
      date_reported: format(reportedDate, 'yyyy-MM-dd'),
      due_date: format(faker.date.future({ years: 0.5, refDate: reportedDate }), 'yyyy-MM-dd'),
      completion_date: completionDate ? format(completionDate, 'yyyy-MM-dd') : null,
      notes: faker.lorem.sentence(),
    });
  }
  await batchInsert('work_orders', workOrders, progressCallback);
  progressCallback('--- Work Orders Seeding Complete ---');
  return workOrders;
}


export async function seedMaintenanceData(progressCallback = () => {}) {
  progressCallback("--- Starting Maintenance Data Seeding ---");

  const equipmentData = [];
  const numberOfEquipment = 75; 

  for (let i = 0; i < numberOfEquipment; i++) {
    const purchaseDate = faker.date.past({ years: 7 }); 
    const lastMaintainedDate = faker.date.between({ from: subDays(purchaseDate, -30), to: new Date() });
    const intervalDays = faker.helpers.arrayElement([30, 60, 90, 120, 180, 270, 365]);
    const nextDueDate = addDays(lastMaintainedDate, intervalDays);

    equipmentData.push({
      equipmentname: `${faker.helpers.arrayElement(EQUIPMENT_TYPES)} ${faker.commerce.productAdjective()} #${faker.string.alphanumeric(5).toUpperCase()}`,
      type: faker.helpers.arrayElement(EQUIPMENT_TYPES),
      status: faker.helpers.arrayElement(EQUIPMENT_STATUSES),
      purchase_date: format(purchaseDate, 'yyyy-MM-dd'),
      cost: faker.finance.amount({ min: 250, max: 150000, dec: 2 }), 
      location_description: faker.helpers.arrayElement(LOCATIONS),
      serial_number: faker.string.uuid(), 
      maintenance_schedule: {
        interval_days: intervalDays,
        last_maintained_date: format(lastMaintainedDate, 'yyyy-MM-dd'),
        next_due_date: format(nextDueDate, 'yyyy-MM-dd'),
        notes: faker.lorem.sentences(faker.number.int({ min:1, max: 3 })), 
        assigned_technician: faker.person.fullName(),
        priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  try {
    await batchInsert('equipment', equipmentData, progressCallback);
    progressCallback(`Seeded ${numberOfEquipment} equipment items.`);

    const { data: seededEquipment, error: eqError } = await supabase.from('equipment').select('equipment_uid, equipmentname');
    if (eqError) throw eqError;
    if (!seededEquipment || seededEquipment.length === 0) {
        progressCallback("No equipment available after seeding. Skipping work order seeding.");
    } else {
        const { data: personnelList } = await supabase.from('personnel').select('personnel_uuid');
        const { fetchAllUsers } = await import('../seed.js'); // Dynamically import to avoid circular deps if any
        let users = await fetchAllUsers(progressCallback);
        users = Array.isArray(users) ? users : [];
        await seedWorkOrders(seededEquipment, personnelList || [], users, 50, progressCallback);
    }

    progressCallback(`--- Maintenance Data Seeding Complete ---`);
    return `${numberOfEquipment} equipment items and related work orders seeded successfully for Maintenance.`;
  } catch (error) {
    console.error("Maintenance data seeding failed:", error);
    progressCallback(`Maintenance data seeding failed: ${error.message}`);
    throw error;
  }
}