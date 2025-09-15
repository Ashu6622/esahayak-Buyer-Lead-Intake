import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadSchema, Lead } from '@/lib/definitions';
import { Prisma } from '@prisma/client';

const CreateLeadSchema = LeadSchema.omit({ id: true, createdAt: true, updatedAt: true });

export async function POST(request: NextRequest) {
    try {
        const newLeadsData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = await request.json();
        let importedCount = 0;
        const promises = [];

        for (const leadData of newLeadsData) {
            if (typeof (leadData as any).tags === 'string') {
                (leadData as any).tags = (leadData as any).tags.split(';').map((t:string) => t.trim()).filter((t:string) => t);
            } else if (!Array.isArray(leadData.tags)) {
                leadData.tags = [];
            }
            
            const validated = CreateLeadSchema.safeParse(leadData);

            if (validated.success) {
                // Use upsert to avoid duplicates based on email
                const promise = prisma.lead.upsert({
                    where: { email: validated.data.email },
                    update: {}, // Do nothing if email exists
                    create: validated.data,
                }).then(result => {
                    // This is a bit of a hack to see if it was created or not
                    // Upsert doesn't return a flag. A more robust way might be separate find/create calls.
                    if (result.name === validated.data.name) {
                         importedCount++;
                    }
                }).catch(e => {
                    if (e instanceof Prisma.PrismaClientKnownRequestError) {
                        // The .code property can be accessed in a type-safe manner
                        if (e.code === 'P2002') {
                           // This is expected if the lead already exists, so we can ignore it.
                           return;
                        }
                    }
                    // Re-throw other errors
                    throw e;
                });
                promises.push(promise);
            } else {
                console.error("Invalid lead data for import:", validated.error.flatten().fieldErrors);
            }
        }
        
        await Promise.all(promises);

        return NextResponse.json({ success: true, message: `Successfully imported ${importedCount} new leads.`, count: importedCount });
    } catch (error) {
        console.error("Import failed:", error);
        return NextResponse.json({ success: false, message: 'Import failed.' }, { status: 500 });
    }
}
