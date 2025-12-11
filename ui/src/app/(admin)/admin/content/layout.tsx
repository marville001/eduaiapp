"use client";

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

const contentNavItems = [
	{
		title: "Navbar Menus",
		href: "/admin/content/navbar-menus",
	},
	{
		title: "Footer Menus",
		href: "/admin/content/footer-menus",
	},
	{
		title: "Testimonials",
		href: "/admin/content/testimonials",
	},
	{
		title: "FAQs",
		href: "/admin/content/faqs",
	},
	{
		title: "Promo Banner",
		href: "/admin/content/promo-banners"
	}
];

export default function ContentLayout({ children }: PropsWithChildren) {
	const pathname = usePathname();

	return (
		<div className="space-y-6">
			{/* Navigation Tabs */}
			<div className="border-b border-gray-200">
				<nav className="-mb-px flex space-x-8">
					{contentNavItems.map((item) => {
						const isActive = pathname === item.href;
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