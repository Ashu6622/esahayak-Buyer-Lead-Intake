import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@/lib/definitions';

export async function POST(request: NextRequest) {
    try {
        const { id, status } = await request.json();
        if (!id || !status) {
            return NextResponse.json({ message: 'Missing id or status' }, { status: 400 });
        }

        await prisma.lead.update({
            where: { id },
            data: { status: status as LeadStatus },
        });
        
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[UPDATE_LEAD_STATUS_ERROR]', error);
        if ((error as any).code === 'P2025') {
            return NextResponse.json({ success: false, message: 'Lead not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: false, message: 'Failed to update status.' }, { status: 500 });
    }
}
