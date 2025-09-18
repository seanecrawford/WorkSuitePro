import { faker } from '@faker-js/faker';
import { supabase, batchInsert } from '@/../scripts/seed-utils.js';

const KANBAN_COLUMN_TITLES = ["Backlog", "In progress", "Review"];

export async function seedKanbanColumns(projectsParam, usersParam, progressCallback = () => {}) {
  let projects = Array.isArray(projectsParam) ? projectsParam : [];
  let users = Array.isArray(usersParam) ? usersParam : [];
  progressCallback(`Starting to seed Kanban columns: ${KANBAN_COLUMN_TITLES.join(', ')}...`);

  const kanbanColumnsData = [];
  
  const { data: existingColumns, error: fetchError } = await supabase
    .from('kanban_columns')
    .select('title');

  if (fetchError) {
    progressCallback(`Error fetching existing Kanban columns: ${fetchError.message}. Proceeding with caution.`);
  }
  const existingTitles = new Set((existingColumns || []).map(c => c.title));

  for (let i = 0; i < KANBAN_COLUMN_TITLES.length; i++) {
    const title = KANBAN_COLUMN_TITLES[i];
    if (existingTitles.has(title)) {
      progressCallback(`Kanban column "${title}" already exists. Skipping.`);
      continue;
    }

    const project = projects?.length > 0 ? projects[0] : null;
    const user = users?.length > 0 ? users[0] : null;

    kanbanColumnsData.push({
      columnid: faker.string.uuid(),
      title: title,
      position: i, 
      projectid: project ? project.projectid : null, 
      user_id: user ? user.id : null, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (kanbanColumnsData.length > 0) {
    await batchInsert('kanban_columns', kanbanColumnsData, progressCallback);
  } else {
    progressCallback('All standard Kanban columns already exist or no new ones to seed.');
  }
  
  progressCallback('Kanban Columns seeding complete.');
  
  const { data: seededColumns, error } = await supabase.from('kanban_columns').select('columnid, projectid, user_id, title');
  if (error) {
    progressCallback(`Error fetching seeded Kanban columns: ${error.message}`);
    return [];
  }
  return (seededColumns || []).filter(sc => KANBAN_COLUMN_TITLES.includes(sc.title));
}

export async function seedKanbanTasks(countPerColumn, columnsParam, personnelParam, projectTasksParam, progressCallback = () => {}) {
  let columns = Array.isArray(columnsParam) ? columnsParam : [];
  let personnel = Array.isArray(personnelParam) ? personnelParam : [];
  let projectTasks = Array.isArray(projectTasksParam) ? projectTasksParam : [];

  if (!columns?.length) {
    progressCallback('Skipping Kanban Tasks: Missing columns data. This is a critical dependency.');
    return [];
  }
  
  const targetColumns = columns.filter(c => KANBAN_COLUMN_TITLES.includes(c.title));
  if (!targetColumns.length) {
    progressCallback(`Skipping Kanban Tasks: None of the required columns (${KANBAN_COLUMN_TITLES.join(", ")}) found.`);
    return [];
  }

  progressCallback(`Starting to seed Kanban tasks, up to ${countPerColumn} per column for target columns...`);

  const tasksData = [];
  const priorities = ['Urgent', 'High', 'Medium', 'Low', 'None'];
  const taskStatuses = ['Todo', 'In Progress', 'Review', 'Done', 'Blocked']; 

  for (const column of targetColumns) {
    if (!column || !column.columnid) {
        progressCallback("Skipping tasks for an invalid Kanban column.");
        continue;
    }
    const numTasks = faker.number.int({ min: 1, max: countPerColumn });
    for (let i = 0; i < numTasks; i++) {
      const assignedTo = personnel?.length > 0 ? faker.helpers.arrayElement(personnel) : null;
      const relevantProjectTasks = projectTasks?.length > 0 && column.projectid 
        ? projectTasks.filter(pt => pt.projectid === column.projectid) 
        : [];
      const linkedProjectTask = relevantProjectTasks.length > 0 ? faker.helpers.arrayElement(relevantProjectTasks) : null;

      let status = faker.helpers.arrayElement(taskStatuses);
      if (column.title === "Backlog") status = "Todo";
      else if (column.title === "In progress") status = "In Progress";
      else if (column.title === "Review") status = "Review";
      
      const taskTitle = `${faker.word.verb()} ${faker.word.adjective()} ${faker.word.noun()}`.replace(/^./, char => char.toUpperCase());
      const taskDescription = faker.lorem.sentence(5);


      tasksData.push({
        taskid: faker.string.uuid(),
        columnid: column.columnid,
        title: taskTitle,
        description: taskDescription,
        status: status,
        priority: faker.helpers.arrayElement(priorities),
        due_date: faker.date.future({ years: 0.5 }).toISOString().split('T')[0],
        task_order: i,
        assigned_to_personnel_uuid: assignedTo ? assignedTo.personnel_uuid : null,
        project_task_uid: linkedProjectTask ? linkedProjectTask.task_uid : null,
        user_id: column.user_id || (assignedTo ? (personnel.find(p => p.personnel_uuid === assignedTo.personnel_uuid)?.auth_userid) : null),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (tasksData.length > 0) {
    await batchInsert('kanban_tasks', tasksData, progressCallback);
  } else {
    progressCallback('No Kanban tasks generated to seed.');
  }
  
  progressCallback('Kanban Tasks seeding complete.');
  return tasksData;
}