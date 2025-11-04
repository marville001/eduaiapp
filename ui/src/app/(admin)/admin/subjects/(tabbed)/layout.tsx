"use client";

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const subjectNavItems = [
  {
    title: "All Subjects",
    href: "/admin/subjects",
  },
  {
    title: "Add Subject",
    href: "/admin/subjects/new",
  },
  {
    title: "AI Prompts",
    href: "/admin/subjects/prompts",
  },
];

export default function SubjectsLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {subjectNavItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href === "/admin/subjects" && pathname.match(/^\/admin\/subjects\/\d+$/));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}