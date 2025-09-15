import { LeadForm } from '@/components/leads/lead-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewLeadPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Create New Lead</CardTitle>
        <CardDescription>Enter the details for your new prospective buyer.</CardDescription>
      </CardHeader>
      <CardContent>
        <LeadForm />
      </CardContent>
    </Card>
  );
}
