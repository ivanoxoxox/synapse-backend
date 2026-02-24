const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'synapse-secret-2025';
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = bcrypt.hashSync('synapse2025', 10);

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Synapse API is running!' });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER || !bcrypt.compareSync(password, ADMIN_PASS_HASH)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.get('/registrations/export/csv', requireAuth, async (req, res) => {
  const regs = await prisma.registration.findMany({ orderBy: { registeredAt: 'desc' } });
  const headers = ['Ticket ID','Full Name','Email','Phone','Type','Organization','Designation','Session','Dietary','Status','Registered At'];
  const rows = regs.map(r => [
    r.id, r.fullName, r.email, r.phone || '', r.type,
    r.org || '', r.designation || '', r.session || '',
    r.dietary || '', r.status,
    new Date(r.registeredAt).toLocaleString('en-PH')
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=synapse2025-registrations.csv');
  res.send(csv);
});

app.post('/registrations', async (req, res) => {
  try {
    const data = req.body;
    const id = 'SNP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const registration = await prisma.registration.create({ data: { ...data, id } });
    res.json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/registrations', requireAuth, async (req, res) => {
  const registrations = await prisma.registration.findMany({ orderBy: { registeredAt: 'desc' } });
  res.json(registrations);
});

app.get('/registrations/:id', async (req, res) => {
  const reg = await prisma.registration.findUnique({ where: { id: req.params.id } });
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
  } catch (err) {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.patch('/registrations/:id/uncheckin', requireAuth, async (req, res) => {
  try {
    const reg = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: 'Registered', checkedInAt: null }
    });
    res.json(reg);
  } catch (err) {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.delete('/registrations/:id', requireAuth, async (req, res) => {
  try {
    await prisma.scanLog.deleteMany({ where: { ticketId: req.params.id } });
    await prisma.registration.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.get('/scans', requireAuth, async (req, res) => {
  const scans = await prisma.scanLog.findMany({ orderBy: { time: 'desc' }, take: 50 });
  res.json(scans);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Synapse backend running on port ' + PORT);
});
