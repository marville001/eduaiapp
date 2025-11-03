"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock blog data - in real app, this would come from API/CMS
const featuredBlogs = [
  {
    id: "1",
    title: "10 Proven Study Techniques That Actually Work",
    slug: "proven-study-techniques-that-work",
    excerpt: "Discover evidence-based study methods that can improve your learning efficiency and academic performance.",
    featuredImage: "/api/placeholder/400/250",
    category: "Study Tips",
    author: "Dr. Sarah Johnson",
    publishedAt: "2024-01-15",
    readTime: "5 min read",
    isFeatured: true,
  },
  {
    id: "2",
    title: "How AI is Revolutionizing Education in 2024",
    slug: "ai-revolutionizing-education-2024",
    excerpt: "Explore the latest AI technologies transforming how students learn and teachers educate in the digital age.",
    featuredImage: "/api/placeholder/400/250",
    category: "Technology",
    author: "Prof. Michael Chen",
    publishedAt: "2024-01-12",
    readTime: "7 min read",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Overcoming Math Anxiety: A Complete Guide",
    slug: "overcoming-math-anxiety-guide",
    excerpt: "Learn practical strategies to build confidence and overcome the fear of mathematics with proven techniques.",
    featuredImage: "/api/placeholder/400/250",
    category: "Mathematics",
    author: "Lisa Rodriguez",
    publishedAt: "2024-01-10",
    readTime: "6 min read",
    isFeatured: true,
  },
];

const categoryColors = {
  "Study Tips": "bg-blue-100 text-blue-800",
  "Technology": "bg-purple-100 text-purple-800",
  "Mathematics": "bg-green-100 text-green-800",
  "Science": "bg-orange-100 text-orange-800",
  "Languages": "bg-pink-100 text-pink-800",
};

export default function BlogSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">Latest from Our Blog</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Educational Insights & Tips
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest educational trends, study tips, and insights 
            from our team of academic experts and AI researchers.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredBlogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`}>
              <Card className="group h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
                <div className="relative">
                  {/* Featured Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-purple-300" />
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={`${categoryColors[blog.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'} border-0`}
                      >
                        {blog.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="font-medium">{blog.readTime}</span>
                    </div>

                    {/* Read More */}
                    <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                      <span>Read More</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-neutral-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Never Miss an Update
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest educational insights, 
            study tips, and platform updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}