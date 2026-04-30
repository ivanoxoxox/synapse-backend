const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: [
    'https://ivanoxoxox.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'synapse-secret-2025';
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = bcrypt.hashSync('synapse2025', 10);

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(403).json({ error: 'Invalid or expired token' }); }
}

function requireUser(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(403).json({ error: 'Invalid or expired token' }); }
}

app.get('/seed-events', async (req, res) => {
  try {
    await prisma.event.deleteMany();
    await prisma.event.createMany({
      data: [
        { title: 'Synapse AI Summit 2025', description: 'A full-day conference exploring the frontiers of artificial intelligence — from large language models and generative AI to real-world enterprise applications. Featuring keynotes from industry leaders, live demos, and hands-on workshops.', venue: 'SMX Convention Center, Pasay City', startDate: new Date('2025-08-15T08:00:00'), endDate: new Date('2025-08-15T18:00:00'), status: 'Upcoming', bannerColor: '#38bdf8', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 500, capacityVIP: 500, capacityStudent: 500 },
        { title: 'CyberShield Conference 2025', description: 'The Philippines premier cybersecurity event bringing together ethical hackers, security engineers, and IT professionals. Sessions cover threat intelligence, penetration testing, cloud security, and the latest attack vectors.', venue: 'Marriott Grand Ballroom, Pasay City', startDate: new Date('2025-09-05T09:00:00'), endDate: new Date('2025-09-06T17:00:00'), status: 'Upcoming', bannerColor: '#ef4444', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 300, capacityVIP: 300, capacityStudent: 300 },
        { title: 'DesignForward: UX & Product Summit', description: 'A two-day immersive experience for designers, product managers, and developers. Deep dive into human-centered design, design systems, accessibility, and the intersection of AI and UX.', venue: 'The Tent at Solaire, Paranaque City', startDate: new Date('2025-07-20T09:00:00'), endDate: new Date('2025-07-21T17:00:00'), status: 'Ongoing', bannerColor: '#a78bfa', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 250, capacityVIP: 250, capacityStudent: 250 },
        { title: 'Launchpad: Startup & Innovation Forum', description: 'Connect with founders, investors, and mentors at the most energetic startup event in Southeast Asia. Pitch competitions, fireside chats, VC panels, and networking sessions designed to accelerate your venture.', venue: 'BGC Arts Center, Taguig City', startDate: new Date('2025-06-10T08:00:00'), endDate: new Date('2025-06-10T20:00:00'), status: 'Completed', bannerColor: '#fbbf24', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 400, capacityVIP: 400, capacityStudent: 400 },
        { title: 'DataPH: Data Science & ML Conference', description: 'The go-to event for data scientists, ML engineers, and analytics professionals. Covering Python for data, machine learning pipelines, MLOps, real-time analytics, and AI ethics with speakers from Google, Meta, and top local tech companies.', venue: 'Crowne Plaza Manila Galleria, Quezon City', startDate: new Date('2025-10-18T08:30:00'), endDate: new Date('2025-10-19T17:00:00'), status: 'Upcoming', bannerColor: '#10b981', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 350, capacityVIP: 350, capacityStudent: 350 },
      ]
    });
    res.json({ message: '5 events seeded successfully!' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => {
  res.json({ message: 'Synapse API is running!' });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER || !bcrypt.compareSync(password, ADMIN_PASS_HASH))
    return res.status(401).json({ error: 'Invalid username or password' });
  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.post('/auth/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hashed = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, fullName: firstName + ' ' + lastName, email, password: hashed }
    });
    const token = jwt.sign({ userId: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/auth/user-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ userId: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/events', async (req, res) => {
  const events = await prisma.event.findMany({ orderBy: { startDate: 'asc' } });
  res.json(events);
});

app.get('/events/:id', async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.post('/events', requireAuth, async (req, res) => {
  try {
    const event = await prisma.event.create({ data: req.body });
    res.json(event);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.patch('/events/:id', requireAuth, async (req, res) => {
  try {
    const event = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
    res.json(event);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/events/:id', requireAuth, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: 'Event deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/registrations/export/csv', requireAuth, async (req, res) => {
  const regs = await prisma.registration.findMany({ orderBy: { registeredAt: 'desc' }, include: { event: true } });
  const headers = ['Ticket ID','Full Name','Email','Phone','Organization','Status','Event','Registered At'];
  const rows = regs.map(r => [
    r.id, r.fullName, r.email, r.phone || '', r.org || '',
    r.status, r.event ? r.event.title : '',
    new Date(r.registeredAt).toLocaleString('en-PH')
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=synapse-registrations.csv');
  res.send(csv);
});

app.post('/registrations', async (req, res) => {
  try {
    const data = req.body;
    const id = 'SNP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const registration = await prisma.registration.create({ data: { ...data, id } });
    res.json(registration);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/registrations', requireAuth, async (req, res) => {
  const registrations = await prisma.registration.findMany({
    orderBy: { registeredAt: 'desc' },
    include: { event: true, user: true }
  });
  res.json(registrations);
});

app.get('/my-tickets', requireUser, async (req, res) => {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user.userId },
    orderBy: { registeredAt: 'desc' },
    include: { event: true }
  });
  res.json(registrations);
});

app.get('/registrations/:id', async (req, res) => {
  const reg = await prisma.registration.findUnique({ where: { id: req.params.id }, include: { event: true } });
  if (!reg) return res.status(404).json({ error: 'Ticket not found' });
  res.json(reg);
});

app.patch('/registrations/:id/checkin', requireAuth, async (req, res) => {
  try {
    const reg = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: 'Checked In', checkedInAt: new Date() }
    });
    await prisma.scanLog.create({ data: { ticketId: reg.id, name: reg.fullName, type: reg.type } });
    res.json(reg);
  } catch (err) { res.status(404).json({ error: 'Ticket not found' }); }
});

app.patch('/registrations/:id/uncheckin', requireAuth, async (req, res) => {
  try {
    const reg = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: 'Registered', checkedInAt: null }
    });
    res.json(reg);
  } catch (err) { res.status(404).json({ error: 'Ticket not found' }); }
});

app.delete('/registrations/:id', requireAuth, async (req, res) => {
  try {
    await prisma.scanLog.deleteMany({ where: { ticketId: req.params.id } });
    await prisma.registration.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(404).json({ error: 'Ticket not found' }); }
});

app.get('/scans', requireAuth, async (req, res) => {
  const scans = await prisma.scanLog.findMany({ orderBy: { time: 'desc' }, take: 50 });
  res.json(scans);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Synapse backend running on port ' + PORT);
  // Auto-seed events if database is empty
  try {
    const count = await prisma.event.count();
    if (count === 0) {
      await prisma.event.createMany({
        data: [
          { title: 'Synapse AI Summit 2025', description: 'A full-day conference exploring the frontiers of artificial intelligence — from large language models and generative AI to real-world enterprise applications.', venue: 'SMX Convention Center, Pasay City', startDate: new Date('2025-08-15T08:00:00'), endDate: new Date('2025-08-15T18:00:00'), status: 'Upcoming', bannerColor: '#38bdf8', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 500, capacityVIP: 500, capacityStudent: 500 },
          { title: 'CyberShield Conference 2025', description: 'The Philippines premier cybersecurity event covering threat intelligence, penetration testing, cloud security, and the latest attack vectors.', venue: 'Marriott Grand Ballroom, Pasay City', startDate: new Date('2025-09-05T09:00:00'), endDate: new Date('2025-09-06T17:00:00'), status: 'Upcoming', bannerColor: '#ef4444', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 300, capacityVIP: 300, capacityStudent: 300 },
          { title: 'DesignForward: UX & Product Summit', description: 'A two-day immersive experience for designers and product managers exploring human-centered design, design systems, and the intersection of AI and UX.', venue: 'The Tent at Solaire, Paranaque City', startDate: new Date('2025-07-20T09:00:00'), endDate: new Date('2025-07-21T17:00:00'), status: 'Ongoing', bannerColor: '#a78bfa', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 250, capacityVIP: 250, capacityStudent: 250 },
          { title: 'Launchpad: Startup & Innovation Forum', description: 'Connect with founders, investors, and mentors at the most energetic startup event in Southeast Asia. Pitch competitions, fireside chats, and VC panels.', venue: 'BGC Arts Center, Taguig City', startDate: new Date('2025-06-10T08:00:00'), endDate: new Date('2025-06-10T20:00:00'), status: 'Completed', bannerColor: '#fbbf24', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 400, capacityVIP: 400, capacityStudent: 400 },
          { title: 'DataPH: Data Science & ML Conference', description: 'The go-to event for data scientists and ML engineers covering pipelines, MLOps, real-time analytics, and AI ethics.', venue: 'Crowne Plaza Manila Galleria, Quezon City', startDate: new Date('2025-10-18T08:30:00'), endDate: new Date('2025-10-19T17:00:00'), status: 'Upcoming', bannerColor: '#10b981', priceGeneral: 0, priceVIP: 0, priceStudent: 0, capacityGeneral: 350, capacityVIP: 350, capacityStudent: 350 },
        ]
      });
      console.log('Auto-seeded 5 events.');
    }
  } catch(e) { console.log('Seed error:', e.message); }
});
