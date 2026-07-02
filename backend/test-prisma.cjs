const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // 1. Create a dummy user
    const user = await prisma.user.create({
      data: {
        email: 'prisma-test-' + Date.now() + '@test.com',
        name: 'Prisma Test'
      }
    });
    
    // 2. Try to create a task for this user exactly as the backend does
    const title = 'Test Task';
    const description = 'Testing API';
    const status = 'Todo';
    const priority = 'Medium';
    const category = 'General';
    const dueDate = '';
    const difficulty = undefined;
    const completed = false;

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    
    console.log("Attempting to create task with data:", {
      title, description, status, priority, dueDate: parsedDueDate, category, difficulty, completed, userId: user.id
    });

    const newTask = await prisma.task.create({
      data: { 
        title, 
        description, 
        status, 
        priority, 
        dueDate: parsedDueDate, 
        category, 
        difficulty, 
        completed, 
        userId: user.id 
      }
    });
    
    console.log("Success:", newTask);
    
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
