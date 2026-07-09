import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { authMiddleware, AuthRequest } from './middleware/auth';

dotenv.config();

// Enforce JWT_SECRET at startup
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.use('/api/auth', authRoutes);

// Protect all routes below this middleware
app.use('/api', authMiddleware);

// --- Initial Data API (Aggregated) ---
app.get('/api/initial-data', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const [tasks, events, links, timeSessions, existingSettings, pages] = await Promise.all([
      prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.event.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.link.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.timeSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.settings.findUnique({ where: { userId } }),
      prisma.block.findMany({ 
        where: { userId, type: 'page' }, 
        orderBy: { createdAt: 'desc' },
      })
    ]);

    let settings = existingSettings;
    if (!settings) {
      settings = await prisma.settings.create({ data: { userId } });
    }

    res.json({ tasks, events, links, timeSessions, settings, pages });
  } catch (error) {
    console.error('Fetch initial data error:', error);
    res.status(500).json({ error: 'Failed to fetch initial data' });
  }
});

// --- Tasks API ---

app.get('/api/tasks', async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate, category, difficulty, completed } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const newTask = await prisma.task.create({
      data: { title, description, status, priority, dueDate: parsedDueDate, category, difficulty, completed, userId: req.user!.id }
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task', details: error.message, stack: error.stack });
  }
});

app.put('/api/tasks/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    
    // Prevent Mass Assignment by extracting only allowed fields
    const { title, description, status, priority, dueDate, category, difficulty, completed } = req.body;
    const parsedDueDate = dueDate === '' ? null : (dueDate ? new Date(dueDate) : undefined);
    const updateData = { title, description, status, priority, dueDate: parsedDueDate, category, difficulty, completed };

    // Clean undefined fields to not overwrite with null unintentionally
    Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

    const updatedTask = await prisma.task.update({
      where: { id, userId: req.user!.id },
      data: updateData
    });
    res.json(updatedTask);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await prisma.task.delete({ where: { id, userId: req.user!.id } });
    res.status(204).send();
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// --- Events API ---

app.get('/api/events', async (req: AuthRequest, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(events);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { title, description, startTime, endTime, date, color } = req.body;
    
    if (!title || !startTime || !endTime || !date) {
      res.status(400).json({ error: 'Title, startTime, endTime, and date are required' });
      return;
    }

    const newEvent = await prisma.event.create({
      data: { title, description, startTime, endTime, date, color, userId: req.user!.id }
    });
    res.status(201).json(newEvent);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.put('/api/events/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    
    // Prevent Mass Assignment
    const { title, description, startTime, endTime, date, color } = req.body;
    const updateData = { title, description, startTime, endTime, date, color };
    Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

    const updatedEvent = await prisma.event.update({
      where: { id, userId: req.user!.id },
      data: updateData
    });
    res.json(updatedEvent);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await prisma.event.delete({ where: { id, userId: req.user!.id } });
    res.status(204).send();
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// --- Time Sessions API ---

app.get('/api/time-sessions', async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.timeSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Fetch time sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch time sessions' });
  }
});

app.post('/api/time-sessions', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { name, duration, date } = req.body;
    
    if (!name || duration === undefined || !date) {
      res.status(400).json({ error: 'Name, duration, and date are required' });
      return;
    }

    const newSession = await prisma.timeSession.create({
      data: { name, duration, date, userId: req.user!.id }
    });
    res.status(201).json(newSession);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Create time session error:', error);
    res.status(500).json({ error: 'Failed to create time session' });
  }
});

app.delete('/api/time-sessions/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await prisma.timeSession.delete({ where: { id, userId: req.user!.id } });
    res.status(204).send();
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Delete time session error:', error);
    res.status(500).json({ error: 'Failed to delete time session' });
  }
});

// --- Links API ---

app.get('/api/links', async (req: AuthRequest, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(links);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Fetch links error:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

app.post('/api/links', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { url, title, description, category, icon } = req.body;
    
    if (!url || !title) {
      res.status(400).json({ error: 'URL and title are required' });
      return;
    }

    const newLink = await prisma.link.create({
      data: { url, title, description, category, icon, userId: req.user!.id }
    });
    res.status(201).json(newLink);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Create link error:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

app.delete('/api/links/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await prisma.link.delete({ where: { id, userId: req.user!.id } });
    res.status(204).send();
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// --- Settings API ---

app.get('/api/settings', async (req: AuthRequest, res) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { userId: req.user!.id }
    });
    if (!settings) {
      settings = await prisma.settings.create({ data: { userId: req.user!.id } });
    }
    res.json(settings);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Fetch settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req: AuthRequest, res) => {
  try {
    // Prevent Mass Assignment
    const { theme, focusMode } = req.body;
    const updateData = { theme, focusMode };
    Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

    let settings = await prisma.settings.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (settings) {
      settings = await prisma.settings.update({
        where: { userId: req.user!.id },
        data: updateData
      });
    } else {
      settings = await prisma.settings.create({ data: { ...updateData, userId: req.user!.id } });
    }
    res.json(settings);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- Blocks API ---
import { generateKeyBetween } from 'fractional-indexing';

app.get('/api/blocks/pages', async (req: AuthRequest, res) => {
  try {
    const pages = await prisma.block.findMany({
      where: { userId: req.user!.id, type: 'page' },
      orderBy: { rank: 'asc' },
    });
    res.json(pages);
  } catch (error) {
    console.error('Fetch pages error:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

app.get('/api/blocks/:parentId/children', async (req: AuthRequest, res) => {
  try {
    const parentIdParam = req.params.parentId as string;
    const parentId = parentIdParam === 'root' ? null : parentIdParam;
    const blocks = await prisma.block.findMany({
      where: { userId: req.user!.id, parentId },
      orderBy: { rank: 'asc' }
    });
    res.json(blocks);
  } catch (error) {
    console.error('Fetch block children error:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

app.get('/api/blocks/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const block = await prisma.block.findUnique({
      where: { id, userId: req.user!.id }
    });
    if (!block) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }
    res.json(block);
  } catch (error) {
    console.error('Fetch block error:', error);
    res.status(500).json({ error: 'Failed to fetch block' });
  }
});

app.post('/api/blocks', async (req: AuthRequest, res) => {
  try {
    const { parentId, type, content } = req.body;
    
    // Find the last child to generate the next rank
    const lastChild = await prisma.block.findFirst({
      where: { parentId: parentId || null, userId: req.user!.id },
      orderBy: { rank: 'desc' }
    });
    
    const rank = generateKeyBetween(lastChild ? lastChild.rank : null, null);
    
    const newBlock = await prisma.block.create({
      data: { 
        parentId: parentId || null, 
        type: type || 'text',
        content: content || {},
        rank,
        userId: req.user!.id 
      }
    });
    res.status(201).json(newBlock);
  } catch (error) {
    console.error('Create block error:', error);
    res.status(500).json({ error: 'Failed to create block' });
  }
});

app.put('/api/blocks/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    
    const { content, type } = req.body;
    const updateData = { content, type };
    Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

    const updatedBlock = await prisma.block.update({
      where: { id, userId: req.user!.id },
      data: updateData
    });
    res.json(updatedBlock);
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Block not found' });
      return;
    }
    console.error('Update block error:', error);
    res.status(500).json({ error: 'Failed to update block' });
  }
});

app.put('/api/blocks/:parentId/sync', async (req: AuthRequest, res) => {
  try {
    const parentId = req.params.parentId as string;
    const { blocks } = req.body; // Array of BlockNote blocks
    
    // Simple sync: delete existing children and recreate them.
    // In a real production app, you'd want to diff and preserve IDs, but for this constraint we'll recreate.
    await prisma.block.deleteMany({
      where: { parentId, userId: req.user!.id }
    });

    const createBlocks = (blockNoteBlocks: any[], currentParentId: string) => {
      let currentRank = 'a0';
      const promises: any[] = [];

      for (const block of blockNoteBlocks) {
        const id = crypto.randomUUID();
        promises.push(
          prisma.block.create({
            data: {
              id,
              parentId: currentParentId,
              type: block.type,
              content: block.props, // Store props in content
              rank: currentRank,
              userId: req.user!.id
            }
          })
        );
        
        if (block.children && block.children.length > 0) {
          promises.push(...createBlocks(block.children, id));
        }

        currentRank = generateKeyBetween(currentRank, null);
      }
      return promises;
    };

    const promises = createBlocks(blocks, parentId);
    await Promise.all(promises);

    res.json({ success: true });
  } catch (error) {
    console.error('Sync blocks error:', error);
    res.status(500).json({ error: 'Failed to sync blocks' });
  }
});

app.patch('/api/blocks/:id/move', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { newParentId, previousBlockRank, nextBlockRank } = req.body;
    
    const rank = generateKeyBetween(
      previousBlockRank || null, 
      nextBlockRank || null
    );

    const updatedBlock = await prisma.block.update({
      where: { id, userId: req.user!.id },
      data: {
        parentId: newParentId || null,
        rank
      }
    });
    res.json(updatedBlock);
  } catch (error) {
    console.error('Move block error:', error);
    res.status(500).json({ error: 'Failed to move block' });
  }
});

app.delete('/api/blocks/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await prisma.block.delete({ where: { id, userId: req.user!.id } });
    res.status(204).send();
  } catch (error) {
    if (error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Block not found' });
      return;
    }
    console.error('Delete block error:', error);
    res.status(500).json({ error: 'Failed to delete block' });
  }
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

