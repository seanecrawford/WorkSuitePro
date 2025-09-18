import { faker } from '@faker-js/faker';
import { batchInsert, supabase, COMPANY_INDUSTRIES } from '../seed-utils.js';
import { format } from 'date-fns';

const DEAL_STAGES = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'On Hold'];
const COMMUNICATION_TYPES = ['Email', 'Call', 'Meeting', 'Note', 'LinkedIn Message', 'Demo', 'Follow-up'];

export async function seedCrmData(authUsersParam = [], progressCallback = () => {}) {
  let authUsers = Array.isArray(authUsersParam) ? authUsersParam : [];
  progressCallback("--- Starting CRM Data Seeding ---");

  const { data: companies, error: companiesError } = await supabase.from('companies').select('company_uid, companyname');
  if (companiesError) {
    progressCallback(`Error fetching companies for CRM seeding: ${companiesError.message}`);
    throw companiesError;
  }
  if (!companies || companies.length === 0) {
    progressCallback("No companies found. Please seed companies first or ensure they exist.");
    return "CRM seeding skipped: No companies found.";
  }
  progressCallback(`Fetched ${companies.length} companies for CRM data generation.`);

  const userIds = authUsers.map(u => u.id);
  if (userIds.length === 0) {
    progressCallback("Warning: No authenticated users passed to CRM seeder. Deal owners and communication loggers might be null.");
  }

  const clientContactsData = [];
  const numberOfContacts = companies.length * faker.number.int({ min: 1, max: 5 });
  for (let i = 0; i < numberOfContacts; i++) {
    const company = faker.helpers.arrayElement(companies);
    clientContactsData.push({
      company_uid: company.company_uid,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName(), provider: `${company.companyname.toLowerCase().replace(/\s+/g, '').substring(0,10)}.example.com` }),
      phone: faker.phone.number(),
      job_title: faker.person.jobTitle(),
      notes: faker.lorem.paragraph(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  await batchInsert('client_contacts', clientContactsData, progressCallback);
  progressCallback(`Seeded ${clientContactsData.length} client contacts.`);

  const { data: clientContacts, error: contactsError } = await supabase.from('client_contacts').select('contact_id, company_uid');
  if (contactsError) {
    progressCallback(`Error fetching seeded client contacts: ${contactsError.message}`);
    throw contactsError;
  }
  if (!clientContacts || clientContacts.length === 0) {
    progressCallback("No client contacts found after seeding. Deals and communication logs might be affected.");
  }

  const dealsLeadsData = [];
  const numberOfDeals = companies.length * faker.number.int({ min: 0, max: 3 });
  for (let i = 0; i < numberOfDeals; i++) {
    if (companies.length === 0) continue;
    const company = faker.helpers.arrayElement(companies);
    
    let relevantContact = null;
    if (clientContacts && clientContacts.length > 0) {
        const companyContacts = clientContacts.filter(c => c.company_uid === company.company_uid);
        if (companyContacts.length > 0) {
            relevantContact = faker.helpers.arrayElement(companyContacts);
        }
    }

    dealsLeadsData.push({
      company_uid: company.company_uid,
      contact_id: relevantContact ? relevantContact.contact_id : null,
      deal_name: `${faker.commerce.productName()} Deal for ${company.companyname}`,
      stage: faker.helpers.arrayElement(DEAL_STAGES),
      value: faker.finance.amount({ min: 1000, max: 250000, dec: 2 }),
      expected_close_date: format(faker.date.future({ years: 1 }), 'yyyy-MM-dd'),
      probability: faker.number.int({ min: 5, max: 95 }),
      owner_user_id: userIds.length > 0 ? faker.helpers.arrayElement(userIds) : null,
      description: faker.lorem.sentences(2),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  if (dealsLeadsData.length > 0) {
    await batchInsert('deals_leads', dealsLeadsData, progressCallback);
  }
  progressCallback(`Seeded ${dealsLeadsData.length} deals/leads.`);
  
  const { data: deals, error: dealsError } = await supabase.from('deals_leads').select('deal_id, company_uid, contact_id');
   if (dealsError) {
    progressCallback(`Error fetching seeded deals: ${dealsError.message}`);
    throw dealsError;
  }

  const communicationLogsData = [];
  const numberOfLogs = (clientContacts?.length || 0 + deals?.length || 0) * faker.number.int({ min: 1, max: 4 });
  for (let i = 0; i < numberOfLogs; i++) {
    const logType = faker.helpers.arrayElement(['contact', 'deal', 'company_general']);
    let company_uid = null;
    let contact_id = null;
    let deal_id = null;

    if (logType === 'contact' && clientContacts && clientContacts.length > 0) {
      const contact = faker.helpers.arrayElement(clientContacts);
      contact_id = contact.contact_id;
      company_uid = contact.company_uid;
    } else if (logType === 'deal' && deals && deals.length > 0) {
      const deal = faker.helpers.arrayElement(deals);
      deal_id = deal.deal_id;
      company_uid = deal.company_uid;
      contact_id = deal.contact_id; // Can be null if deal has no contact
    } else if (companies.length > 0) { 
      const company = faker.helpers.arrayElement(companies);
      company_uid = company.company_uid;
    }
    
    if (!company_uid) continue; 

    communicationLogsData.push({
      company_uid: company_uid,
      contact_id: contact_id,
      deal_id: deal_id,
      communication_type: faker.helpers.arrayElement(COMMUNICATION_TYPES),
      subject: faker.lorem.sentence(5),
      body_content: faker.lorem.paragraphs(faker.number.int({min: 1, max: 3})),
      communication_date: faker.date.recent({ days: 90 }),
      user_id: userIds.length > 0 ? faker.helpers.arrayElement(userIds) : null,
      created_at: new Date().toISOString(),
    });
  }
  if (communicationLogsData.length > 0) {
    await batchInsert('communication_logs', communicationLogsData, progressCallback);
  }
  progressCallback(`Seeded ${communicationLogsData.length} communication logs.`);

  progressCallback("--- CRM Data Seeding Complete ---");
  return "CRM data (contacts, deals, communication logs) seeded successfully.";
}