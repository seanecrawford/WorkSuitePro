import { faker } from '@faker-js/faker';
import { supabase, batchInsert, FORECAST_CONFIDENCE_LEVELS } from '@/../scripts/seed-utils.js';

export async function seedFinancialForecasts(count, projects, companies, progressCallback = () => {}) {
  if (!projects?.length) {
    progressCallback('Skipping Financial Forecasts: Missing projects data. This is a critical dependency.');
    return [];
  }
  if (!companies?.length) {
    progressCallback('Skipping Financial Forecasts: Missing companies data. This is a critical dependency.');
    return [];
  }
  progressCallback(`Starting to seed ${count} financial forecast records...`);

  const forecastsData = [];
  for (let i = 0; i < count; i++) {
    const project = faker.helpers.arrayElement(projects);
     if (!project || !project.projectid) {
        progressCallback("Skipping a financial forecast record: selected project is invalid.");
        continue;
    }
    const company = companies.find(c => c.companyid === project.companyid) || faker.helpers.arrayElement(companies);
     if (!company || !company.companyid) {
        progressCallback("Skipping a financial forecast record: selected company is invalid or main company list empty.");
        continue;
    }
    const forecastDate = faker.date.recent({ days: 90 });
    const periodStart = faker.date.future({ years: 0.5, refDate: forecastDate });
    
    forecastsData.push({
      forecast_id: faker.string.uuid(),
      projectid: project.projectid,
      companyid: company.companyid,
      forecast_date: forecastDate.toISOString().split('T')[0],
      period_description: `Forecast for Q${Math.ceil((periodStart.getMonth() + 1) / 3)} ${periodStart.getFullYear()}`,
      projected_revenue: faker.finance.amount({ min: 20000, max: 2000000, dec: 0 }),
      projected_expenses: faker.finance.amount({ min: 10000, max: 1500000, dec: 0 }),
      assumptions: faker.lorem.sentences(2),
      confidence_level: faker.helpers.arrayElement(FORECAST_CONFIDENCE_LEVELS),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      forecast_period: periodStart.toISOString().split('T')[0], 
      expected_revenue: faker.finance.amount({ min: 15000, max: 1800000, dec: 0 }), 
    });
  }

  if (forecastsData.length === 0) {
    progressCallback('No financial forecast records generated, possibly due to missing project or company data.');
    return [];
  }

  await batchInsert('financial_forecasts', forecastsData, progressCallback);
  progressCallback('Financial Forecasts seeding complete.');
  
  const { data: seededData, error } = await supabase.from('financial_forecasts').select('forecast_id');
  if (error) {
    progressCallback(`Error fetching seeded financial forecasts data: ${error.message}`);
    return [];
  }
  return seededData || [];
}