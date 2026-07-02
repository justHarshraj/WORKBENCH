const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }

    const reqBody = {
      title: 'Test Task',
      description: 'Testing API',
      priority: 'Medium',
      category: 'General',
      status: 'Todo',
      dueDate: '',
      completed: false
    };

    const { title, description, status, priority, dueDate, category, difficulty, completed } = reqBody;
    
    if (!title) {
      console.log('Title required');
      return;
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    
    console.log('Creating with parsedDueDate:', parsedDueDate);
    
    const newTask = await prisma.task.create({
      data: { title, description, status, priority, dueDate: parsedDueDate, category, difficulty, completed, userId: user.id }
    });
    
    console.log('Success!', newTask);
  } catch (error) {
    console.error('EXACT ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
