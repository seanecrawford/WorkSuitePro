import { faker } from '@faker-js/faker';
import { supabase, batchInsert, MILESTONE_STATUSES } from '@/../scripts/seed-utils.js';

export async function seedMilestones(countPerProject, projects, progressCallback = () => {}) {
  if (!projects?.length) {
    progressCallback('Skipping Milestones: Missing projects data. This is a critical dependency.');
    return [];
  }
  progressCallback(`Starting to seed milestones for ${projects.length} projects, up to ${countPerProject} each...`);

  const milestonesData = [];
  for (const project of projects) {
    if (!project || !project.projectid || !project.startdate) {
        progressCallback(`Skipping milestones for a project due to missing data: ${JSON.stringify(project)}`);
        continue;
    }
    for (let i = 0; i < countPerProject; i++) {
      const projectStartDate = new Date(project.startdate);
      const projectEndDate = project.enddate ? new Date(project.enddate) : faker.date.future({years:1, refDate: projectStartDate});
      
      // Ensure projectEndDate is after projectStartDate
      const validProjectEndDate = projectEndDate > projectStartDate ? projectEndDate : faker.date.future({years:1, refDate: projectStartDate});

      const dueDate = faker.date.between({ from: projectStartDate, to: validProjectEndDate });
      const completedDate = faker.helpers.arrayElement([null, faker.date.between({ from: projectStartDate, to: dueDate })]);
      
      milestonesData.push({
        milestone_uid: faker.string.uuid(),
        projectid: project.projectid,
        title: `Milestone ${i + 1}: ${faker.company.buzzPhrase()}`,
        description: faker.lorem.sentence(),
        duedate: dueDate.toISOString().split('T')[0],
        completed_date: completedDate ? completedDate.toISOString().split('T')[0] : null,
        status: completedDate ? 'Completed' : faker.helpers.arrayElement(MILESTONE_STATUSES.filter(s => s !== 'Completed')),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (milestonesData.length === 0) {
    progressCallback('No milestones generated to seed, possibly due to missing project data earlier.');
    return [];
  }

  await batchInsert('milestones', milestonesData, progressCallback);
  progressCallback('Milestones seeding complete.');

  const { data: seededData, error } = await supabase.from('milestones').select('milestoneid, milestone_uid, projectid, created_at, duedate');
  if (error) {
    progressCallback(`Error fetching seeded milestones data: ${error.message}`);
    return [];
  }
  return seededData || [];
}