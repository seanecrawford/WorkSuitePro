import { faker } from '@faker-js/faker';
import { supabase, batchInsert, REVENUE_STREAM_STATUSES } from '@/../scripts/seed-utils.js';

export async function seedRevenueStreams(count, projects, companies, progressCallback = () => {}) {
  if (!projects?.length) {
    progressCallback('Skipping Revenue Streams: Missing projects data. This is a critical dependency.');
    return [];
  }
  if (!companies?.length) {
    progressCallback('Skipping Revenue Streams: Missing companies data. This is a critical dependency.');
    return [];
  }
  progressCallback(`Starting to seed ${count} revenue stream records...`);

  const revenueStreamsData = [];
  for (let i = 0; i < count; i++) {
    const project = faker.helpers.arrayElement(projects);
    if (!project || !project.projectid) {
        progressCallback("Skipping a revenue stream record: selected project is invalid.");
        continue;
    }
    const company = companies.find(c => c.companyid === project.companyid) || faker.helpers.arrayElement(companies);
    if (!company || !company.companyid) {
        progressCallback("Skipping a revenue stream record: selected company is invalid or main company list empty.");
        continue;
    }
    const startDate = faker.date.past({ years: 1 });
    const endDate = faker.date.future({ years: 2, refDate: startDate });

    revenueStreamsData.push({
      stream_id: faker.string.uuid(),
      projectid: project.projectid,
      companyid: company.companyid,
      stream_name: `${faker.commerce.productAdjective()} ${faker.commerce.department()} Stream`,
      description: faker.lorem.sentence(),
      expected_monthly_revenue: faker.finance.amount({ min: 1000, max: 100000, dec: 0 }),
      actual_revenue_mtd: faker.finance.amount({ min: 0, max: 80000, dec: 0 }),
      actual_revenue_ytd: faker.finance.amount({ min: 0, max: 500000, dec: 0 }),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: faker.helpers.arrayElement(REVENUE_STREAM_STATUSES),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (revenueStreamsData.length === 0) {
    progressCallback('No revenue stream records generated, possibly due to missing project or company data.');
    return [];
  }

  await batchInsert('revenue_streams', revenueStreamsData, progressCallback);
  progressCallback('Revenue Streams seeding complete.');

  const { data: seededData, error } = await supabase.from('revenue_streams').select('stream_id');
  if (error) {
    progressCallback(`Error fetching seeded revenue streams data: ${error.message}`);
    return [];
  }
  return seededData || [];
}