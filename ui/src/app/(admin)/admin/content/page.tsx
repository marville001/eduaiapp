"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  MessageSquare, 
  Image, 
  Star, 
  HelpCircle 
} from 'lucide-react';
import Link from 'next/link';

const contentAreas = [
  {
    title: "Navbar Menus",
    description: "Manage navigation menus with nested support",
    icon: Menu,
    href: "/admin/content/navbar-menus",
    status: "active",
  },
  {
    title: "Footer Menus",
    description: "Configure footer navigation links",
    icon: MessageSquare,
    href: "/admin/content/footer-menus",
    status: "coming-soon",
  },
  {
    title: "Banners",
    description: "Manage promotional banners and announcements",
    icon: Image,
    href: "/admin/content/banners", 
    status: "coming-soon",
  },
  {
    title: "Testimonials",
    description: "Customer testimonials and reviews",
    icon: Star,
    href: "/admin/content/testimonials",
    status: "coming-soon",
  },
  {
    title: "FAQs",
    description: "Frequently asked questions management",
    icon: HelpCircle,
    href: "/admin/content/faqs",
    status: "coming-soon",
  },
];

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Configuration</h1>
        <p className="text-gray-600">Manage your website content and navigation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentAreas.map((area) => {
          const Icon = area.icon;
          return (
            <Card key={area.title} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{area.title}</CardTitle>
                    {area.status === 'coming-soon' && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{area.description}</p>
                <Button 
                  asChild={area.status === 'active'} 
                  disabled={area.status === 'coming-soon'}
                  className="w-full"
                  variant={area.status === 'active' ? 'default' : 'secondary'}
                >
                  {area.status === 'active' ? (
                    <Link href={area.href}>
                      Manage {area.title}
                    </Link>
                  ) : (
                    <span>Coming Soon</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}