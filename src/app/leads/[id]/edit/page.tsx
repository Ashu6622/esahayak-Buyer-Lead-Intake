import { LeadForm } from '@/components/leads/lead-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { Lead } from '@/lib/definitions';
import { prisma } from '@/lib/prisma';

async function getLeadById(id: string): Promise<Lead | null> {
  if (!id) return null;
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
    });
    return lead;
  } catch (error) {
    console.error('[GET_LEAD_BY_ID_ERROR]', error);
    return null;
  }
}

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const lead = await getLeadById(resolvedParams.id);

  if (!lead) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Edit Lead</CardTitle>
        <CardDescription>Update the details for {lead.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        <LeadForm lead={lead} />
      </CardContent>
    </Card>
  );
}
