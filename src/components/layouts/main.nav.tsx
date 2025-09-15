'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle } from 'lucide-react';
import { Logo } from '@/components/icons';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads/new', label: 'Create Lead', icon: PlusCircle },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-headline font-bold">LeadTrak</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  'group-data-[collapsible=icon]:justify-center'
                )}
                tooltip={{children: item.label}}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
