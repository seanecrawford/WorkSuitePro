import { faker } from '@faker-js/faker';
import { supabase, batchInsert, TASK_STATUSES, TASK_PRIORITIES } from '@/../scripts/seed-utils.js';

export async function seedProjectTasks(countPerMilestone, milestones, personnel, progressCallback = () => {}) {
  if (!milestones?.length) {
    progressCallback('Skipping Project Tasks: Missing milestones data. This is a critical dependency.');
    return [];
  }
  if (!personnel?.length) {
    progressCallback('Skipping Project Tasks: Missing personnel data for assignments. Tasks will be unassigned.');
    // Continue, but tasks will not have assignees
  }
  progressCallback(`Starting to seed project tasks for ${milestones.length} milestones, up to ${countPerMilestone} each...`);

  const projectTasksData = [];
  for (const milestone of milestones) {
     if (!milestone || !milestone.projectid || !milestone.milestoneid || !milestone.duedate || !milestone.created_at) {
        progressCallback(`Skipping tasks for a milestone due to missing data: ${JSON.stringify(milestone)}`);
        continue;
    }
    for (let i = 0; i < countPerMilestone; i++) {
      const milestoneCreatedAt = new Date(milestone.created_at);
      const milestoneDueDate = new Date(milestone.duedate);

      // Ensure milestoneDueDate is after milestoneCreatedAt
      const validMilestoneDueDate = milestoneDueDate > milestoneCreatedAt ? milestoneDueDate : faker.date.future({years:0.5, refDate: milestoneCreatedAt});

      const startDate = faker.date.between({ from: milestoneCreatedAt, to: validMilestoneDueDate });
      const dueDate = faker.date.between({ from: startDate, to: validMilestoneDueDate });
      const actualEndDate = faker.helpers.arrayElement([null, faker.date.between({ from: startDate, to: dueDate })]);
      const assignee = personnel?.length > 0 ? faker.helpers.arrayElement(personnel) : null;

      projectTasksData.push({
        task_uid: faker.string.uuid(),
        projectid: milestone.projectid, 
        milestoneid: milestone.milestoneid,
        title: `Task ${i + 1}: ${faker.hacker.verb()} ${faker.hacker.noun()}`,
        description: faker.lorem.paragraph(),
        assignee_personnel_uuid: assignee ? assignee.personnel_uuid : null,
        startdate: startDate.toISOString().split('T')[0],
        duedate: dueDate.toISOString().split('T')[0],
        actual_end_date: actualEndDate ? actualEndDate.toISOString().split('T')[0] : null,
        status: actualEndDate ? 'Done' : faker.helpers.arrayElement(TASK_STATUSES.filter(s => s !== 'Done')),
        priority: faker.helpers.arrayElement(TASK_PRIORITIES),
        estimated_hours: faker.number.int({ min: 2, max: 40 }),
        actual_hours: actualEndDate ? faker.number.int({ min: 1, max: 50 }) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (projectTasksData.length === 0) {
    progressCallback('No project tasks generated to seed, possibly due to missing milestone data earlier.');
    return [];
  }

  if (projectTasksData.length > 0) {
    await batchInsert('projecttasks', projectTasksData, progressCallback);
  } else {
    progressCallback('No project tasks generated to seed.');
  }
  
  progressCallback('Project Tasks seeding complete.');

  const { data: seededData, error } = await supabase.from('projecttasks').select('taskid, task_uid, projectid'); 
  if (error) {
    progressCallback(`Error fetching seeded project tasks data: ${error.message}`);
    return [];
  }
  return seededData || [];
}