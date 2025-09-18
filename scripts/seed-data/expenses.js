import { faker } from '@faker-js/faker';
import { supabase, batchInsert, EXPENSE_CATEGORIES } from '@/../scripts/seed-utils.js';

export async function seedExpenses(count, projects, companies, personnel, progressCallback = () => {}) {
  if (!projects?.length) {
    progressCallback('Skipping Expenses: Missing projects data. This is a critical dependency.');
    return [];
  }
  if (!companies?.length) {
    progressCallback('Skipping Expenses: Missing companies data. This is a critical dependency.');
    return [];
  }
  // personnel can be empty, handled by setting personnelid to null.
  progressCallback(`Starting to seed ${count} expense records...`);

  const expensesData = [];
  for (let i = 0; i < count; i++) {
    const project = faker.helpers.arrayElement(projects); // This can error if projects is empty
    if (!project || !project.projectid) {
        progressCallback("Skipping an expense record: selected project is invalid.");
        continue;
    }
    const company = companies.find(c => c.companyid === project.companyid) || faker.helpers.arrayElement(companies); // This can error if companies is empty
    if (!company || !company.companyid) {
        progressCallback("Skipping an expense record: selected company is invalid or main company list empty.");
        continue;
    }
    
    // const responsiblePersonnel = personnel?.length > 0 ? faker.helpers.arrayElement(personnel) : null; // Kept for potential future use

    expensesData.push({
      expense_uid: faker.string.uuid(),
      projectid: project.projectid,
      companyid: company.companyid,
      expensedate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
      category: faker.helpers.arrayElement(EXPENSE_CATEGORIES),
      description: faker.commerce.productName() + ' - ' + faker.lorem.words(3),
      amount: faker.finance.amount({ min: 50, max: 10000, dec: 2 }),
      vendor: faker.company.name(),
      receipt_url: faker.internet.url() + '/receipt.pdf',
      personnelid: null, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (expensesData.length === 0) {
    progressCallback('No expense records generated to seed, possibly due to missing project or company data earlier.');
    return [];
  }

  await batchInsert('expenses', expensesData, progressCallback);
  progressCallback('Expenses seeding complete.');

  const { data: seededData, error } = await supabase.from('expenses').select('expenseid, expense_uid');
  if (error) {
    progressCallback(`Error fetching seeded expenses data: ${error.message}`);
    return [];
  }
  return seededData || [];
}