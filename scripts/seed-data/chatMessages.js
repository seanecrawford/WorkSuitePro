import { faker } from '@faker-js/faker';
import { supabase, batchInsert } from '@/../scripts/seed-utils.js';

export async function seedChatMessages(countPerGroup, chatGroups, users, progressCallback = () => {}) {
  if (!chatGroups?.length) {
    progressCallback('Skipping Chat Messages: Missing chat groups data. This is a critical dependency.');
    return [];
  }
  if (!users?.length) {
    progressCallback('Skipping Chat Messages: Missing users data for senders. This is a critical dependency.');
    return [];
  }
  progressCallback(`Starting to seed chat messages for ${chatGroups.length} groups, up to ${countPerGroup} each...`);

  const messagesData = [];
  for (const group of chatGroups) {
    if(!group || !group.group_id) {
        progressCallback("Skipping messages for an invalid chat group object passed.");
        continue;
    }
    const numMessages = faker.number.int({ min: 1, max: countPerGroup });
    let lastTimestamp = faker.date.recent({ days: 30 });

    for (let i = 0; i < numMessages; i++) {
      const sender = faker.helpers.arrayElement(users);
      if(!sender || !sender.id) {
        progressCallback("Skipping a message due to invalid sender from users list.");
        continue;
      }
      lastTimestamp = faker.date.soon({ days: 1, refDate: lastTimestamp }); 

      messagesData.push({
        message_id: faker.string.uuid(),
        group_id: group.group_id,
        sender_id: sender.id, 
        content: faker.lorem.sentence({min: 3, max: 20}),
        message_type: 'text',
        created_at: lastTimestamp.toISOString(),
        updated_at: lastTimestamp.toISOString(),
      });
    }
  }

  if (messagesData.length > 0) {
    await batchInsert('chat_messages', messagesData, progressCallback);
  } else {
    progressCallback('No chat messages generated to seed. Possible critical dependency issue upstream.');
  }
  
  progressCallback('Chat Messages seeding complete.');
  return messagesData;
}

export async function seedChatGroups(count, projects, users, progressCallback = () => {}) {
  if (!users?.length) {
    progressCallback('Skipping Chat Groups: Missing users data for creators. This is a critical dependency.');
    return [];
  }
  if (!projects?.length) {
    progressCallback('Warning: Missing projects data for Chat Groups. Chat groups will not be linked to projects.');
  }
  progressCallback(`Starting to seed ${count} chat groups...`);

  const chatGroupsToInsert = [];
  const groupCreatorLinks = []; 

  for (let i = 0; i < count; i++) {
    const creator = faker.helpers.arrayElement(users);
    if (!creator || !creator.id) {
        progressCallback("Skipping a chat group due to invalid creator from users list.");
        continue;
    }
    const project = projects?.length > 0 ? faker.helpers.arrayElement(projects) : null;
    const groupId = faker.string.uuid(); 
    chatGroupsToInsert.push({
      group_id: groupId,
      name: faker.company.buzzPhrase(), 
      description: faker.lorem.sentence(),
      is_private: faker.datatype.boolean(0.3),
      created_by_userid: creator.id,
      projectid: project ? project.projectid : null, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    groupCreatorLinks.push({ groupId, creatorId: creator.id }); 
  }
  
  if (chatGroupsToInsert.length === 0) {
    progressCallback('No chat groups generated to seed. Possible critical dependency issue upstream.');
    return [];
  }

  await batchInsert('chat_groups', chatGroupsToInsert, progressCallback);
  progressCallback(`Chat Groups batch insert complete. ${chatGroupsToInsert.length} groups attempted.`);
  
  const { data: actuallySeededGroups, error: fetchError } = await supabase
    .from('chat_groups')
    .select('group_id, created_by_userid')
    .in('group_id', chatGroupsToInsert.map(g => g.group_id));

  if (fetchError) {
    progressCallback(`Error fetching actually seeded chat groups: ${fetchError.message}. Group member seeding might fail.`);
    console.error("Error fetching seeded chat_groups for member population:", fetchError);
    return []; 
  }
  if (!actuallySeededGroups || actuallySeededGroups.length === 0) {
    progressCallback('No groups were actually seeded or fetched after insert. Cannot seed members.');
    return [];
  }
  
  progressCallback(`${actuallySeededGroups.length} groups successfully created/fetched. Now seeding group members...`);

  const chatGroupMembersData = [];
  for (const group of actuallySeededGroups) {
    const creatorId = group.created_by_userid; 
    
    chatGroupMembersData.push({
      membership_id: faker.string.uuid(),
      group_id: group.group_id,
      userid: creatorId,
      role: 'admin',
      joined_at: new Date().toISOString(),
    });

    const numberOfRandomMembers = faker.number.int({ min: 1, max: Math.min(3, users.length -1) });
    const potentialMembers = users.filter(u => u.id !== creatorId); 
    
    if (potentialMembers.length > 0) {
        const randomMembers = faker.helpers.arrayElements(potentialMembers, Math.min(numberOfRandomMembers, potentialMembers.length));
        for (const member of randomMembers) {
            if (member && member.id) {
                if (!chatGroupMembersData.some(gm => gm.group_id === group.group_id && gm.userid === member.id)) {
                    chatGroupMembersData.push({
                        membership_id: faker.string.uuid(),
                        group_id: group.group_id,
                        userid: member.id,
                        role: 'member',
                        joined_at: new Date().toISOString(),
                    });
                }
            }
        }
    }
  }

  if (chatGroupMembersData.length > 0) {
    await batchInsert('chat_group_members', chatGroupMembersData, progressCallback);
    progressCallback('Chat Group Members seeding complete.');
  } else {
    progressCallback('No chat group members generated to seed.');
  }
    
  return actuallySeededGroups; 
}