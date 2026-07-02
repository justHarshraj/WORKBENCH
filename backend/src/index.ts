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

// --- Tasks API ---

app.get('/api/tasks', async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
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
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
