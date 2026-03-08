const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.deleteMany();
  console.log('Cleared existing events...');

  await prisma.event.createMany({
    data: [
      {
        title: 'Synapse AI Summit 2025',
        description: 'A full-day conference exploring the frontiers of artificial intelligence — from large language models and generative AI to real-world enterprise applications. Featuring keynotes from industry leaders, live demos, and hands-on workshops.',
        venue: 'SMX Convention Center, Pasay City',
        startDate: new Date('2025-08-15T08:00:00').toISOString(),
        endDate: new Date('2025-08-15T18:00:00').toISOString(),
        status: 'Upcoming',
        bannerColor: '#38bdf8',
        priceGeneral: 0, priceVIP: 0, priceStudent: 0,
        capacityGeneral: 500, capacityVIP: 500, capacityStudent: 500,
      },
      {
        title: 'CyberShield Conference 2025',
        description: 'The Philippines premier cybersecurity event bringing together ethical hackers, security engineers, and IT professionals. Sessions cover threat intelligence, penetration testing, cloud security, and the latest attack vectors.',
        venue: 'Marriott Grand Ballroom, Pasay City',
        startDate: new Date('2025-09-05T09:00:00').toISOString(),
        endDate: new Date('2025-09-06T17:00:00').toISOString(),
        status: 'Upcoming',
        bannerColor: '#ef4444',
        priceGeneral: 0, priceVIP: 0, priceStudent: 0,
        capacityGeneral: 300, capacityVIP: 300, capacityStudent: 300,
      },
      {
        title: 'DesignForward: UX & Product Summit',
        description: 'A two-day immersive experience for designers, product managers, and developers. Deep dive into human-centered design, design systems, accessibility, and the intersection of AI and UX.',
        venue: 'The Tent at Solaire, Paranaque City',
        startDate: new Date('2025-07-20T09:00:00').toISOString(),
        endDate: new Date('2025-07-21T17:00:00').toISOString(),
        status: 'Ongoing',
        bannerColor: '#a78bfa',
        priceGeneral: 0, priceVIP: 0, priceStudent: 0,
        capacityGeneral: 250, capacityVIP: 250, capacityStudent: 250,
      },
      {
        title: 'Launchpad: Startup & Innovation Forum',
        description: 'Connect with founders, investors, and mentors at the most energetic startup event in Southeast Asia. Pitch competitions, fireside chats, VC panels, and networking sessions designed to accelerate your venture.',
        venue: 'BGC Arts Center, Taguig City',
        startDate: new Date('2025-06-10T08:00:00').toISOString(),
        endDate: new Date('2025-06-10T20:00:00').toISOString(),
        status: 'Completed',
        bannerColor: '#fbbf24',
        priceGeneral: 0, priceVIP: 0, priceStudent: 0,
        capacityGeneral: 400, capacityVIP: 400, capacityStudent: 400,
      },
      {
        title: 'DataPH: Data Science & ML Conference',
        description: 'The go-to event for data scientists, ML engineers, and analytics professionals. Covering Python for data, machine learning pipelines, MLOps, real-time analytics, and AI ethics with speakers from Google, Meta, and top local tech companies.',
        venue: 'Crowne Plaza Manila Galleria, Quezon City',
        startDate: new Date('2025-10-18T08:30:00').toISOString(),
        endDate: new Date('2025-10-19T17:00:00').toISOString(),
        status: 'Upcoming',
        bannerColor: '#10b981',
        priceGeneral: 0, priceVIP: 0, priceStudent: 0,
        capacityGeneral: 350, capacityVIP: 350, capacityStudent: 350,
      },
    ]
  });

  console.log('✅ 5 demo events created successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
