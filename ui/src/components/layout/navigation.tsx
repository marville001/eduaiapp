/* eslint-disable @next/next/no-img-element */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { Subject, subjectApi } from '@/lib/api/subject.api';
import { useUserStore } from '@/stores/user.store';
import { ChevronDown, GraduationCap, Home, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const tools = [
  { name: "AI Essay Writer", href: "/tools/essay-writer" },
  { name: "Citation Generator", href: "/tools/citation-generator" },
  { name: "Grammar Checker", href: "/tools/grammar-checker" },
  { name: "Plagiarism Checker", href: "/tools/plagiarism-checker" },
  { name: "Math Solver", href: "/tools/math-solver" },
  { name: "Study Planner", href: "/tools/study-planner" },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { logout } = useAuth();
  const user = useUserStore(state => state.user);

  const { data: settings } = useSettings();

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  };

  const handleLogout = async () => {
    await logout(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const getSubjects = async () => {
      subjectApi.getHierarchical(true).then((data) => {
        setSubjects(data);
      });
    };
    getSubjects();
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {/* <div className="bg-primary p-2 rounded-lg"> */}
              <img src={settings?.appLogo} alt="" className='h-10 ' />
              {/* <Brain className="h-6 w-6 text-white" /> */}
              {/* </div> */}
              <span className="text-xl font-bold text-gray-900">
                {settings?.platformName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Subjects Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Subjects</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-1">
                  {subjects.map((subject) => (
                    <div key={subject.slug} className="relative group/sub">
                      <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <span>{subject.name}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                      </div>
                      <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                        <div className="p-1">
                          <Link
                            href={`/${subject.slug}`}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                          >
                            All {subject.name}
                          </Link>
                          <div className="border-t border-gray-200 my-1" />
                          {subject.subSubjects?.map((child) => (
                            <Link
                              key={child.slug}
                              href={`/${child.slug}`}
                              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Tools</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-1">
                  {tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Explore Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Explore</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-1">
                  <Link
                    href="/how-it-works"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/pricing"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/about"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/blog" className="text-gray-700 hover:text-gray-900">
              Blog
            </Link>
          </div>

          {/* Auth Buttons */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || undefined} alt={getUserName()} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user?.isAdminUser ? "/admin" : "/app"} className="flex items-center cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/upgrade">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Upgrade
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <div className="space-y-2">
                <div className="font-medium text-gray-900 px-3 py-2">Subjects</div>
                {subjects.map((subject) => (
                  <div key={subject.slug} className="pl-4">
                    <Link
                      href={`/${subject.slug}`}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{subject.name}</span>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4">
                <div className="font-medium text-gray-900 px-3 py-2">Tools</div>
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="block px-6 py-2 text-gray-700 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>

              <div className="space-y-2 pt-4">
                <Link
                  href="/blog"
                  className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                {
                  user ? null :
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                }

              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}