import { faker } from '@faker-js/faker';
import { supabase, batchInsert } from '@/../scripts/seed-utils.js';

export async function seedFinancialPerformance(count, companies, projects, regions, focusCenters, progressCallback = () => {}) {
  if (!companies?.length) {
    progressCallback('Skipping Financial Performance: Missing companies data. This is a critical dependency.');
    return [];
  }
  if (!projects?.length) {
    progressCallback('Skipping Financial Performance: Missing projects data. This is a critical dependency.');
    return [];
  }
  // regions and focusCenters can be empty, will be handled by assigning null or using defaults if available
  progressCallback(`Starting to seed ${count} financial performance records...`);
  
  const financialPerformanceData = [];
  for (let i = 0; i < count; i++) {
    const project = faker.helpers.arrayElement(projects);
    if (!project || !project.projectid) {
        progressCallback("Skipping a financial performance record: selected project is invalid.");
        continue;
    }
    const company = companies.find(c => c.companyid === project.companyid) || faker.helpers.arrayElement(companies);
     if (!company || !company.companyid) {
        progressCallback("Skipping a financial performance record: selected company is invalid or main company list empty.");
        continue;
    }

    const region = regions?.length ? (regions.find(r => r.regionid === project.regionid) || faker.helpers.arrayElement(regions)) : null;
    const focusCenter = focusCenters?.length ? (focusCenters.find(fc => fc.focuscenterid === project.focuscenterid) || faker.helpers.arrayElement(focusCenters)) : null;

    const periodStartDate = faker.date.past({ years: 1 });
    const periodEndDate = faker.date.between({ from: periodStartDate, to: new Date() });
    const revenue = faker.finance.amount({ min: 10000, max: 5000000, dec: 0 });
    const expenses = faker.finance.amount({ min: 5000, max: revenue * 0.8, dec: 0 }); 
    const costOfGoodsSold = faker.finance.amount({ min: 1000, max: expenses * 0.7, dec: 0 });
    const operatingExpenses = expenses - costOfGoodsSold > 0 ? expenses - costOfGoodsSold : faker.finance.amount({ min: 1000, max: 200000, dec: 0 });
    const netIncome = revenue - expenses;
    
    financialPerformanceData.push({
      companyid: company.companyid,
      projectid: project.projectid,
      period_start_date: periodStartDate.toISOString().split('T')[0],
      period_end_date: periodEndDate.toISOString().split('T')[0],
      revenue: revenue,
      cost_of_goods_sold: costOfGoodsSold,
      operating_expenses: operatingExpenses,
      net_income: netIncome,
      budgeted_revenue: faker.finance.amount({ min: revenue * 0.8, max: revenue * 1.2, dec: 0 }),
      budgeted_cost: faker.finance.amount({ min: expenses * 0.8, max: expenses * 1.2, dec: 0 }),
      regionid: region?.regionid || null,
      focuscenterid: focusCenter?.focuscenterid || null,
      notes: faker.lorem.sentence(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expenses: expenses, 
    });
  }
  
  if (financialPerformanceData.length === 0) {
    progressCallback('No financial performance records generated, possibly due to missing project or company data.');
    return [];
  }

  await batchInsert('financialperformance', financialPerformanceData, progressCallback);
  progressCallback('Financial Performance seeding complete.');
  
  const { data: seededData, error } = await supabase.from('financialperformance').select('performanceid');
  if (error) {
    progressCallback(`Error fetching seeded financial performance data: ${error.message}`);
    return [];
  }
  return seededData || [];
}