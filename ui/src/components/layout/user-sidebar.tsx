"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/user.store';
import {
	BookOpen,
	Brain,
	LayoutDashboard,
	LogOut,
	Menu,
	MessageSquare,
	User,
	X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
	{
		title: "Dashboard",
		href: "/app",
		icon: LayoutDashboard,
		description: "Overview and statistics"
	},
	{
		title: "AI Chat",
		href: "/ai-tutor",
		icon: Brain,
		description: "Ask new questions",
		badge: "New"
	},
	{
		title: "My Questions",
		href: "/app/questions",
		icon: MessageSquare,
		description: "View question history"
	},
	{
		title: "Subjects",
		href: "/app/subjects",
		icon: BookOpen,
		description: "Explore available subjects"
	},
	{
		title: "Profile",
		href: "/app/profile",
		icon: User,
		description: "Manage your account"
	},
	// {
	// 	title: "Settings",
	// 	href: "/app/settings",
	// 	icon: Settings,
	// 	description: "App preferences"
	// },
	// {
	// 	title: "Help",
	// 	href: "/app/help",
	// 	icon: HelpCircle,
	// 	description: "Get help and support"
	// },
];

export default function UserSidebar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const user = useUserStore(state => state.user);
	const { logout } = useAuth();

	const isActive = (href: string): boolean => {
		if (href === "/app") {
			return pathname === "/app";
		}
		return pathname?.startsWith(href) || false;
	};

	const getUserInitials = () => {
		if (!user) return 'U';
		const firstInitial = user.firstName?.[0] || '';
		const lastInitial = user.lastName?.[0] || '';
		return (firstInitial + lastInitial).toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
	};

	const getUserName = () => {
		if (!user) return 'User';
		return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
	};

	const handleLogout = async () => {
		await logout();
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			{/* Mobile Menu Button */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="bg-white shadow-md"
				>
					{isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
				</Button>
			</div>

			{/* Mobile Overlay */}
			{isMobileMenuOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center px-6 py-4 border-b border-gray-200">
						<div className="bg-linear-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
							<Brain className="h-6 w-6 text-white" />
						</div>
						<div className="ml-3">
							<h1 className="text-lg font-bold text-gray-900">MasomoAI</h1>
							<p className="text-xs text-gray-500">Student Dashboard</p>
						</div>
					</div>

					{/* User Info */}


					{/* Navigation */}
					<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
						{menuItems.map((item) => (
							<div key={item.title}>
								{/* Menu item without children */}
								<Link
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.href)
											? 'bg-purple-100 text-purple-700'
											: 'text-gray-700 hover:bg-gray-100'
										}
                  `}
								>
									<item.icon className="h-5 w-5 mr-3 shrink-0" />
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span>{item.title}</span>
											{item.badge && (
												<Badge variant="secondary" className="text-xs ml-2">
													{item.badge}
												</Badge>
											)}
										</div>
										<p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
									</div>
								</Link>
							</div>
						))}
					</nav>

					{/* Bottom Actions */}
					<div className="p-4 border-t border-gray-200 space-y-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleLogout}
							className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
						>
							<LogOut className="h-4 w-4 mr-2" />
							Sign Out
						</Button>
					</div>

					<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
						<div className="flex items-center">
							<div className="w-10 h-10 shrink-0 bg-linear-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
								{getUserInitials()}
							</div>
							<div className="ml-3 flex-1">
								<p className="text-sm font-medium text-gray-900 truncate">{getUserName()}</p>
								<p className="text-xs text-gray-500 truncate line-clamp-1">{user?.email}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}