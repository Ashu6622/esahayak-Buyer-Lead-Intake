'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function revalidateAndRedirect(path: string, redirectTo?: string) {
    revalidatePath(path);
    if (redirectTo) {
        redirect(redirectTo);
    }
}
