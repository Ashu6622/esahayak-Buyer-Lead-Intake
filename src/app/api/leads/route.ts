import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { LeadSchema, PropertyType, LeadStatus, LeadTimeline } from '@/lib/definitions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
  const perPage = 10;
  const offset = (page - 1) * perPage;

  const where: any = {};
  const query = searchParams.get('query');
  if (query) {
      where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
      ];
  }

  const city = searchParams.get('city');
  if (city && city !== 'all') {
      where.city = city;
  }

  const status = searchParams.get('status');
  if (status && status !== 'all') {
      where.status = status as LeadStatus;
  }

  const propertyType = searchParams.get('propertyType');
  if (propertyType && propertyType !== 'all') {
      where.propertyType = propertyType as PropertyType;
  }

  const timeline = searchParams.get('timeline');
  if (timeline && timeline !== 'all') {
      where.timeline = timeline as LeadTimeline;
  }

  try {
    const total = await prisma.lead.count({ where });
    const leads = await prisma.lead.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      skip: offset,
      take: perPage,
    });
    
    return NextResponse.json({ leads, total, page, perPage });
  } catch(error) {
    console.error("[GET_LEADS_ERROR]", error);
    return NextResponse.json({ message: 'Failed to fetch leads.' }, { status: 500 });
  }
}

const CreateLeadSchema = LeadSchema.omit({ id: true, createdAt: true, updatedAt: true });

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedFields = CreateLeadSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json({
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing or invalid fields. Failed to create lead.',
            }, { status: 400 });
        }

        const newLead = await prisma.lead.create({
            data: validatedFields.data,
        });

        return NextResponse.json(newLead, { status: 201 });
    } catch (error) {
        console.error('[CREATE_LEAD_ERROR]', error);
        return NextResponse.json({ message: 'Failed to create lead.' }, { status: 500 });
    }
}
