import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadSchema } from '@/lib/definitions';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const lead = await prisma.lead.findUnique({
            where: { id },
        });

        if (lead) {
            return NextResponse.json(lead);
        }
        return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    } catch (error) {
        console.error('[GET_LEAD_BY_ID_ERROR]', error);
        return NextResponse.json({ message: 'Failed to fetch lead' }, { status: 500 });
    }
}

const UpdateLeadSchema = LeadSchema.omit({ id: true, createdAt: true, updatedAt: true });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedFields = UpdateLeadSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json({
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing or invalid fields.',
            }, { status: 400 });
        }
        
        const updatedLead = await prisma.lead.update({
            where: { id },
            data: validatedFields.data,
        });

        return NextResponse.json(updatedLead);

    } catch (error) {
        console.error('[UPDATE_LEAD_ERROR]', error);
        // Check for specific Prisma error for record not found
        if ((error as any).code === 'P2025') {
            return NextResponse.json({ message: 'Lead not found.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to update lead.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.lead.delete({
            where: { id },
        });
        return NextResponse.json({ success: true, message: 'Lead deleted successfully.' });
    } catch (error) {
        console.error('[DELETE_LEAD_ERROR]', error);
         if ((error as any).code === 'P2025') {
            return NextResponse.json({ success: false, message: 'Lead not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: false, message: 'Failed to delete lead.' }, { status: 500 });
    }
}
