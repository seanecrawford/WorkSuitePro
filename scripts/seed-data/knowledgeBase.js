import { faker } from '@faker-js/faker';
import { supabase, batchInsert } from '@/../scripts/seed-utils.js';

export async function seedKnowledgeBaseCategories(progressCallback = () => {}) {
  progressCallback('Starting to seed Knowledge Base Categories...');
  const categoriesData = [
    { name: 'Product Guides', description: 'Detailed guides on using our products.' },
    { name: 'Troubleshooting', description: 'Solutions to common issues and problems.' },
    { name: 'Company Policies', description: 'Official company policies and procedures.' },
    { name: 'Development Best Practices', description: 'Guidelines for software development.' },
    { name: 'HR & Onboarding', description: 'Information for new and existing employees.' },
  ];

  for (const cat of categoriesData) {
    cat.category_id = faker.string.uuid();
    cat.created_at = new Date().toISOString();
  }
  
  await batchInsert('knowledge_base_categories', categoriesData, progressCallback);
  progressCallback('Knowledge Base Categories seeding complete.');
  
  const { data: seededCategories, error } = await supabase.from('knowledge_base_categories').select('category_id, name');
  if (error) {
    progressCallback(`Error fetching seeded KB categories: ${error.message}`);
    return [];
  }
  return seededCategories || [];
}

export async function seedKnowledgeBaseArticles(countPerCategory, categoriesParam, usersParam, progressCallback = () => {}) {
  let categories = Array.isArray(categoriesParam) ? categoriesParam : [];
  let users = Array.isArray(usersParam) ? usersParam : [];

  if (!categories?.length) {
    progressCallback('Skipping KB Articles: No categories provided.');
    return [];
  }
  if (!users?.length) {
    progressCallback('Skipping KB Articles: No users provided for authorship.');
    return [];
  }
  progressCallback(`Starting to seed KB articles, up to ${countPerCategory} per category...`);

  const articlesData = [];
  for (const category of categories) {
    for (let i = 0; i < countPerCategory; i++) {
      const author = faker.helpers.arrayElement(users);
      const creationDate = faker.date.recent({ days: 90 });
      articlesData.push({
        article_id: faker.string.uuid(),
        user_id: author.id, 
        title: `${category.name}: ${faker.hacker.phrase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
        content: faker.lorem.paragraphs(faker.number.int({ min: 3, max: 7 })),
        category_id: category.category_id,
        tags: faker.helpers.arrayElements(faker.word.words({count: 5}).split(' '), faker.number.int({ min: 2, max: 5 })),
        is_published: faker.datatype.boolean(0.85),
        published_at: creationDate.toISOString(),
        version: 1,
        last_edited_by: author.id,
        created_at: creationDate.toISOString(),
        updated_at: creationDate.toISOString(),
      });
    }
  }

  if (articlesData.length > 0) {
    await batchInsert('knowledge_base_articles', articlesData, progressCallback);
  } else {
    progressCallback('No KB articles generated to seed.');
  }
  
  progressCallback('KB Articles seeding complete.');
  return articlesData;
}