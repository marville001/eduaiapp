"use client";

import { Button } from "@/components/ui/button";
import { useUserStore } from '@/stores/user.store';
import {
  BookOpen,
  Brain,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Upload,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Questions",
    href: "/admin/questions",
    icon: MessageSquare,
  },
  {
    title: "Subjects",
    href: "/admin/subjects",
    icon: BookOpen,
    // children: [
    //   { title: "All Subjects", href: "/admin/subjects" },
    //   { title: "Add Subject", href: "/admin/subjects/new" },
    // ],
  },
  {
    title: "Content Configuration",
    href: "/admin/content",
    icon: Upload,
    children: [
      { title: "Navbar Menus", href: "/admin/content/navbar-menus" },
      { title: "Footer Menus", href: "/admin/content/footer-menus" },
      { title: "Banners", href: "/admin/content/banners" },
      { title: "Testimonials", href: "/admin/content/testimonials" },
      { title: "FAQs", href: "/admin/content/faqs" },
    ],
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: FileText,
    children: [
      { title: "All Posts", href: "/admin/blog" },
      { title: "New Post", href: "/admin/blog/new" },
      { title: "Categories", href: "/admin/blog/categories" },
    ],
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: Upload,
    children: [
      { title: "All Pages", href: "/admin/pages" },
      { title: "New Page", href: "/admin/pages/new" },
    ],
  },
  // {
  //   title: "Subscriptions",
  //   href: "/admin/subscriptions",
  //   icon: CreditCard,
  // },
  // {
  //   title: "Analytics",
  //   href: "/admin/analytics",
  //   icon: BarChart3,
  // },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const user = useUserStore((state) => state.user);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href;// || (href !== "/admin" && pathname.startsWith(href));
  };

  const isExpanded = (title: string) => expandedItems.includes(title);

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
              <h1 className="text-lg font-bold text-gray-900">MasomoAI Admin</h1>
              <p className="text-xs text-gray-500">Management Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  // Menu item with children
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isActive(item.href)
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded(item.title) ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Submenu */}
                    {isExpanded(item.title) && (
                      <div className="mt-2 ml-6 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`
                              block px-3 py-2 text-sm rounded-lg transition-colors
                              ${isActive(child.href)
                                ? 'bg-purple-100 text-purple-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                              }
                            `}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular menu item
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive(item.href)
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}