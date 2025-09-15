import { PrismaClient, PropertyType, LeadStatus, LeadTimeline } from '@prisma/client'

const prisma = new PrismaClient()

const leads = [
    {
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        phone: '555-0101',
        city: 'San Francisco',
        propertyType: 'Condo' as PropertyType,
        status: 'New' as LeadStatus,
        timeline: 'OneThreeMonths' as LeadTimeline,
        notes: 'Interested in a 2-bedroom condo downtown.',
        tags: ['downtown', '2-bedroom'],
    },
    {
        name: 'Bob Williams',
        email: 'bob.w@example.com',
        phone: '555-0102',
        city: 'Oakland',
        propertyType: 'SingleFamily' as PropertyType,
        status: 'Contacted' as LeadStatus,
        timeline: 'ThreeSixMonths' as LeadTimeline,
        notes: 'Looking for a family home with a backyard.',
        tags: ['family-home', 'backyard'],
    },
    {
        name: 'Charlie Brown',
        email: 'charlie.b@example.com',
        phone: '555-0103',
        city: 'San Jose',
        propertyType: 'Townhouse' as PropertyType,
        status: 'Showing' as LeadStatus,
        timeline: 'ASAP' as LeadTimeline,
        notes: 'First-time homebuyer, needs guidance.',
        tags: ['first-time-buyer'],
    },
    {
        name: 'Diana Prince',
        email: 'diana.p@example.com',
        phone: '555-0104',
        city: 'San Francisco',
        propertyType: 'MultiFamily' as PropertyType,
        status: 'UnderContract' as LeadStatus,
        timeline: 'SixPlusMonths' as LeadTimeline,
        notes: 'Real estate investor looking for a duplex.',
        tags: ['investor', 'duplex'],
    },
    {
        name: 'Ethan Hunt',
        email: 'ethan.h@example.com',
        phone: '555-0105',
        city: 'Berkeley',
        propertyType: 'Land' as PropertyType,
        status: 'Closed' as LeadStatus,
        timeline: 'ASAP' as LeadTimeline,
        notes: 'Wants to build a custom home.',
        tags: ['custom-build', 'land-purchase'],
    },
];

async function main() {
  console.log(`Start seeding ...`)
  for (const lead of leads) {
    const newLead = await prisma.lead.upsert({
        where: { email: lead.email },
        update: {},
        create: lead,
    });
    console.log(`Created lead with id: ${newLead.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
