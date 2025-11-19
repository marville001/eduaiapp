"use client";

import UserSidebar from "@/components/layout/user-sidebar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from 'next/link';
import { PropsWithChildren } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
	return (
		<div className="flex h-screen bg-gray-50">
			<UserSidebar />

			<div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
				{/* Header */}
				<header className="bg-white border-b border-gray-200 px-6 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
							<p className="text-gray-600">Manage your learning journey</p>
						</div>
						<div className="flex items-center space-x-4">
							<Button variant="outline" asChild>
								<Link href="/" target="_blank" rel="noopener noreferrer">
									<Eye className="h-4 w-4 mr-2" />
									View Site
								</Link>
							</Button>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="flex-1 overflow-y-auto p-6">
					{children}
				</main>
			</div>
		</div>
	);
}