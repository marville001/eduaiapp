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
import { navbarMenuApi } from '@/lib/api/navbar-menu.api';
import { useUserStore } from '@/stores/user.store';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, GraduationCap, Home, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const user = useUserStore(state => state.user);

  const { data: settings, isLoading: loadingSettings } = useSettings();

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

  const { data: menusData, isLoading: loadingMenus } = useQuery({
    queryKey: ["nav-menus"],
    queryFn: async () => navbarMenuApi.getHierarchical(false),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  const menus = menusData || [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {
              loadingSettings ? (
                <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              ) : (
                <Link href="/" className="flex items-center space-x-2">
                  {/* <div className="bg-primary p-2 rounded-lg"> */}
                  <img src={settings?.appLogo} alt="" className='h-10 ' />
                  {/* <Brain className="h-6 w-6 text-white" /> */}
                  {/* </div> */}
                  <span className="text-xl font-bold text-gray-900">
                    {settings?.platformName}
                  </span>
                </Link>
              )
            }
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Subjects Dropdown */}
            {
              loadingMenus ? (
                <div className='flex gap-2 items-center'>
                  <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              ) :
                menus.length > 0 ?
                  menus.map(menu => (
                    <div key={menu.id} className="relative group">
                      <Link href={`/${menu.url}`} target={menu.target || '_self'} className="flex items-center space-x-1">
                        <span>{menu.title}</span>
                        {
                          (menu.children && menu.children.length > 0) && (
                            <ChevronDown className="h-4 w-4" />
                          )
                        }
                      </Link>
                      {
                        (menu.children && menu.children.length > 0) ? (
                          <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="p-1">
                              {menu.children.map((subMenu) => (
                                <div key={subMenu.slug} className="relative group/sub">
                                  <Link
                                    href={`/${subMenu.url}`}
                                    target={subMenu.target || '_self'}
                                  >
                                    <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm cursor-pointer">
                                      <div className="flex items-center space-x-2">
                                        <span>{subMenu.title}</span>
                                      </div>
                                      {
                                        (subMenu.children && subMenu.children.length > 0) && (
                                          <ChevronDown className="h-4 w-4 -rotate-90" />
                                        )
                                      }
                                    </div>
                                  </Link>
                                  {
                                    (subMenu.children && subMenu.children.length > 0) ? (
                                      <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                                        <div className="p-1">
                                          <div className="border-t border-gray-200 my-1" />
                                          {subMenu.children?.map((child) => (
                                            <Link
                                              key={child.slug}
                                              href={`/${child.slug}`}
                                              target={child.target || '_self'}
                                              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                                            >
                                              {child.title}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null
                                  }
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                          : null
                      }
                    </div>
                  ))
                  : null
            }

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
              {menus.length > 0 ?
                menus.map(menu => (
                  <div key={menu.id} className="border-b border-gray-200">
                    <Link
                      href={`/${menu.url}`}
                      target={menu.target || '_self'}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {menu.title}
                    </Link>
                    {
                      (menu.children && menu.children.length > 0) && (
                        <div className="pl-4">
                          {menu.children.map(subMenu => (
                            <div key={subMenu.slug} className="border-b border-gray-100">
                              <Link
                                href={`/${subMenu.url}`}
                                target={subMenu.target || '_self'}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subMenu.title}
                              </Link>
                              {
                                (subMenu.children && subMenu.children.length > 0) && (
                                  <div className="pl-4">
                                    {subMenu.children.map(child => (
                                      <Link
                                        key={child.slug}
                                        href={`/${child.url}`}
                                        target={child.target || '_self'}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-100"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                      >
                                        {child.title}
                                      </Link>
                                    ))}
                                  </div>
                                )
                              }
                            </div>
                          ))}
                        </div>
                      )
                    }
                  </div>
                ))
                : null
              }
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}