
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, Lightbulb, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
               <Crown className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-headline font-bold text-foreground">
                BuzzerBeater
              </h1>
            </div>
          </SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                <Link href="/admin">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin/suggest'}>
                <Link href="/admin/suggest">
                  <Lightbulb />
                  Suggest Questions
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b md:justify-end">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                 <Link href="/" passHref>
                    <Button variant="outline">
                        Back to Game
                    </Button>
                </Link>
            </header>
            <main className="flex-1 p-6 bg-background/80">
              {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
