import { faker } from '@faker-js/faker';
import { supabase, batchInsert } from '@/../scripts/seed-utils.js';

const ITEM_CATEGORIES = ['Electronics', 'Raw Materials', 'Finished Goods', 'Office Supplies', 'Hardware', 'Software License', 'Consumables', 'Spare Parts'];
const UNITS_OF_MEASURE = ['pcs', 'kg', 'L', 'm', 'set', 'box', 'license'];
const PO_STATUSES = ['Pending', 'Ordered', 'Shipped', 'Received', 'Cancelled', 'Partially Received'];

export async function seedSuppliers(count = 10, progressCallback = () => {}) {
  progressCallback(`--- Seeding Suppliers (Count: ${count}) ---`);
  const existingSuppliers = await supabase.from('suppliers').select('name').limit(count);
  if (existingSuppliers.data && existingSuppliers.data.length >= count) {
    progressCallback(`Suppliers table already has ${existingSuppliers.data.length} records. Skipping seeding.`);
    return existingSuppliers.data;
  }

  const suppliers = [];
  for (let i = 0; i < count; i++) {
    suppliers.push({
      name: faker.company.name(),
      contact_name: faker.person.fullName(),
      contact_email: faker.internet.email(),
      contact_phone: faker.phone.number(),
      address: faker.location.streetAddress(true),
      notes: faker.lorem.sentence(),
    });
  }
  await batchInsert('suppliers', suppliers, progressCallback);
  const { data: seededSuppliers } = await supabase.from('suppliers').select('*');
  progressCallback('--- Suppliers Seeding Complete ---');
  return seededSuppliers || [];
}

export async function seedInventoryItems(count = 50, suppliersList, progressCallback = () => {}) {
  progressCallback(`--- Seeding Inventory Items (Count: ${count}) ---`);
  if (!suppliersList || suppliersList.length === 0) {
    progressCallback("No suppliers provided. Skipping inventory item seeding.");
    return [];
  }
  const existingItems = await supabase.from('inventory_items').select('sku').limit(count);
   if (existingItems.data && existingItems.data.length >= count) {
    progressCallback(`Inventory Items table already has ${existingItems.data.length} records. Skipping seeding.`);
    return existingItems.data;
  }

  const items = [];
  for (let i = 0; i < count; i++) {
    const costPrice = parseFloat(faker.commerce.price({ min: 5, max: 500 }));
    items.push({
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      category: faker.helpers.arrayElement(ITEM_CATEGORIES),
      quantity_on_hand: faker.number.int({ min: 0, max: 1000 }),
      reorder_level: faker.number.int({ min: 10, max: 100 }),
      cost_price: costPrice,
      sale_price: parseFloat((costPrice * faker.number.float({ min: 1.2, max: 2.5 })).toFixed(2)),
      supplier_id: faker.helpers.arrayElement(suppliersList).supplier_id,
      location: `Warehouse ${faker.string.alpha(1).toUpperCase()}-Shelf ${faker.number.int({ min: 1, max: 20 })}`,
      last_stocked_date: faker.date.past({ years: 1 }),
      unit_of_measure: faker.helpers.arrayElement(UNITS_OF_MEASURE),
      image_url: faker.image.urlLoremFlickr({ category: 'technics' }), 
    });
  }
  await batchInsert('inventory_items', items, progressCallback);
  const { data: seededItems } = await supabase.from('inventory_items').select('*');
  progressCallback('--- Inventory Items Seeding Complete ---');
  return seededItems || [];
}

export async function seedPurchaseOrders(count = 20, suppliersList, inventoryItemsList, userListParam, progressCallback = () => {}) {
  let userList = Array.isArray(userListParam) ? userListParam : [];
  progressCallback(`--- Seeding Purchase Orders (Count: ${count}) ---`);
  if (!suppliersList || suppliersList.length === 0 || !inventoryItemsList || inventoryItemsList.length === 0) {
    progressCallback("Missing suppliers or inventory items. Skipping PO seeding.");
    return [];
  }
  
  const existingPOs = await supabase.from('purchase_orders').select('po_number').limit(count);
  if (existingPOs.data && existingPOs.data.length >= count) {
    progressCallback(`Purchase Orders table already has ${existingPOs.data.length} records. Skipping seeding.`);
    return existingPOs.data;
  }

  const purchaseOrders = [];
  const poItems = [];

  for (let i = 0; i < count; i++) {
    const orderDate = faker.date.past({ years: 1 });
    const poId = faker.string.uuid();
    const createdByUserId = userList && userList.length > 0 ? faker.helpers.arrayElement(userList).id : null;

    const po = {
      po_id: poId,
      po_number: `PO-${orderDate.getFullYear()}-${faker.string.alphanumeric(5).toUpperCase()}`,
      supplier_id: faker.helpers.arrayElement(suppliersList).supplier_id,
      order_date: orderDate,
      expected_delivery_date: faker.date.soon({ days: 30, refDate: orderDate }),
      status: faker.helpers.arrayElement(PO_STATUSES),
      notes: faker.lorem.sentence(),
      created_by_userid: createdByUserId,
    };

    let poTotalAmount = 0;
    const numItemsInOrder = faker.number.int({ min: 1, max: 5 });
    for (let j = 0; j < numItemsInOrder; j++) {
      const inventoryItem = faker.helpers.arrayElement(inventoryItemsList);
      const quantityOrdered = faker.number.int({ min: 1, max: 50 });
      const unitCost = inventoryItem.cost_price || parseFloat(faker.commerce.price({ min: 1, max: 100 }));
      const totalItemCost = quantityOrdered * unitCost;
      poTotalAmount += totalItemCost;

      poItems.push({
        po_id: poId,
        item_id: inventoryItem.item_id,
        quantity_ordered: quantityOrdered,
        unit_cost: unitCost,
        total_cost: totalItemCost,
        received_quantity: po.status === 'Received' ? quantityOrdered : (po.status === 'Partially Received' ? faker.number.int({ min: 0, max: quantityOrdered }) : 0),
      });
    }
    po.total_amount = parseFloat(poTotalAmount.toFixed(2));
    purchaseOrders.push(po);
  }

  await batchInsert('purchase_orders', purchaseOrders, progressCallback);
  await batchInsert('purchase_order_items', poItems, progressCallback);
  
  const { data: seededPOs } = await supabase.from('purchase_orders').select('*');
  progressCallback('--- Purchase Orders Seeding Complete ---');
  return seededPOs || [];
}

export async function seedInventoryData(progressCallback = () => {}) {
  progressCallback("--- Starting Inventory Data Seeding ---");
  try {
    // Use fetchAllUsers from seed.js which handles client-side context
    const { fetchAllUsers: getUsers } = await import('../seed.js');
    let users = await getUsers(progressCallback);
    users = Array.isArray(users) ? users : [];


    const suppliers = await seedSuppliers(15, progressCallback);
    if (suppliers.length === 0) {
        progressCallback("No suppliers available, cannot proceed with further inventory seeding.");
        return;
    }
    const inventoryItems = await seedInventoryItems(100, suppliers, progressCallback);
    if (inventoryItems.length === 0) {
        progressCallback("No inventory items available, cannot proceed with PO seeding.");
        return;
    }
    await seedPurchaseOrders(30, suppliers, inventoryItems, users, progressCallback);
    progressCallback("--- Inventory Data Seeding Complete ---");
  } catch (error) {
    console.error("Inventory data seeding failed:", error);
    progressCallback(`Inventory data seeding failed: ${error.message}`);
  }
}

// To run this seed script directly using Node.js
if (typeof process !== 'undefined' && require.main === module) {
  seedInventoryData((message) => console.log(message))
    .then(() => console.log("Inventory seeding script finished successfully."))
    .catch((err) => console.error("Inventory seeding script failed:", err));
}