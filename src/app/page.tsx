import { LeadListClient } from '@/components/leads/lead-list-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { PropertyType, LeadStatus, LeadTimeline } from '@/lib/definitions';

async function getLeads(searchParams?: { [key: string]: string | string[] | undefined }) {
  const page = searchParams?.page ? parseInt(searchParams.page as string, 10) : 1;
  const perPage = 10;
  const offset = (page - 1) * perPage;

  const where: any = {};
  const query = searchParams?.query as string;
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }

  const city = searchParams?.city as string;
  if (city && city !== 'all') {
    where.city = city;
  }

  const status = searchParams?.status as string;
  if (status && status !== 'all') {
    where.status = status as LeadStatus;
  }

  const propertyType = searchParams?.propertyType as string;
  if (propertyType && propertyType !== 'all') {
    where.propertyType = propertyType as PropertyType;
  }

  const timeline = searchParams?.timeline as string;
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
    
    return { leads, total, page, perPage };
  } catch (error) {
    console.error('[GET_LEADS_ERROR]', error);
    return { leads: [], total: 0, page: 1, perPage: 10 };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page ? String(resolvedSearchParams.page) : '1';
  const data = await getLeads(resolvedSearchParams);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Buyer Leads</CardTitle>
        <CardDescription>Manage your prospective buyers.</CardDescription>
      </CardHeader>
      <CardContent>
        <LeadListClient initialData={data} />
      </CardContent>
    </Card>
  );
}
