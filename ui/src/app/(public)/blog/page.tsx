import Link from "next/link";
import { Calendar, User, ArrowRight, Search, Filter } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Mock blog data - in real app, this would come from API/CMS
const blogs = [
  {
    id: "1",
    title: "10 Proven Study Techniques That Actually Work",
    slug: "proven-study-techniques-that-work",
    excerpt: "Discover evidence-based study methods that can improve your learning efficiency and academic performance. From spaced repetition to active recall, learn the techniques that top students use.",
    featuredImage: "/api/placeholder/600/300",
    category: "Study Tips",
    author: "Dr. Sarah Johnson",
    publishedAt: "2024-01-15",
    readTime: "5 min read",
    isFeatured: true,
    isPinned: true,
  },
  {
    id: "2",
    title: "How AI is Revolutionizing Education in 2024",
    slug: "ai-revolutionizing-education-2024",
    excerpt: "Explore the latest AI technologies transforming how students learn and teachers educate in the digital age. From personalized learning to automated grading.",
    featuredImage: "/api/placeholder/600/300",
    category: "Technology",
    author: "Prof. Michael Chen",
    publishedAt: "2024-01-12",
    readTime: "7 min read",
    isFeatured: true,
    isPinned: false,
  },
  {
    id: "3",
    title: "Overcoming Math Anxiety: A Complete Guide",
    slug: "overcoming-math-anxiety-guide",
    excerpt: "Learn practical strategies to build confidence and overcome the fear of mathematics with proven techniques from educational psychologists.",
    featuredImage: "/api/placeholder/600/300",
    category: "Mathematics",
    author: "Lisa Rodriguez",
    publishedAt: "2024-01-10",
    readTime: "6 min read",
    isFeatured: false,
    isPinned: false,
  },
  {
    id: "4",
    title: "The Science of Effective Note-Taking",
    slug: "science-of-effective-note-taking",
    excerpt: "Research-backed methods for taking notes that enhance comprehension and retention. Learn the Cornell method, mind mapping, and digital strategies.",
    featuredImage: "/api/placeholder/600/300",
    category: "Study Tips",
    author: "Dr. Emily Watson",
    publishedAt: "2024-01-08",
    readTime: "4 min read",
    isFeatured: false,
    isPinned: false,
  },
  {
    id: "5",
    title: "Building Better Study Habits in College",
    slug: "building-better-study-habits-college",
    excerpt: "Transform your academic performance with sustainable study habits. Tips for time management, creating study schedules, and maintaining motivation.",
    featuredImage: "/api/placeholder/600/300",
    category: "College Life",
    author: "Mark Thompson",
    publishedAt: "2024-01-05",
    readTime: "8 min read",
    isFeatured: false,
    isPinned: false,
  },
  {
    id: "6",
    title: "Understanding Different Learning Styles",
    slug: "understanding-different-learning-styles",
    excerpt: "Discover your learning style and adapt your study methods accordingly. Visual, auditory, kinesthetic, and reading/writing learners guide.",
    featuredImage: "/api/placeholder/600/300",
    category: "Learning",
    author: "Dr. Amanda Foster",
    publishedAt: "2024-01-03",
    readTime: "6 min read",
    isFeatured: false,
    isPinned: false,
  },
];

const categories = [
  "All",
  "Study Tips",
  "Technology",
  "Mathematics",
  "Science",
  "Languages",
  "College Life",
  "Learning",
];

const categoryColors = {
  "Study Tips": "bg-blue-100 text-blue-800",
  "Technology": "bg-purple-100 text-purple-800",
  "Mathematics": "bg-green-100 text-green-800",
  "Science": "bg-orange-100 text-orange-800",
  "Languages": "bg-pink-100 text-pink-800",
  "College Life": "bg-indigo-100 text-indigo-800",
  "Learning": "bg-yellow-100 text-yellow-800",
};

export default function BlogPage() {
  // Separate pinned and regular blogs
  const pinnedBlogs = blogs.filter(blog => blog.isPinned);
  const regularBlogs = blogs.filter(blog => !blog.isPinned);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Educational Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover study tips, educational insights, and the latest trends in learning 
                from our team of academic experts and researchers.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <Button variant="outline" className="h-12 px-6 border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="px-4 py-2 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Pinned Articles */}
        {pinnedBlogs.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Pinned Articles</h2>
                <Badge className="ml-3 bg-yellow-100 text-yellow-800 border-yellow-200">
                  Featured
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pinnedBlogs.map((blog) => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`}>
                    <Card className="group h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20" />
                        <div className="absolute top-4 left-4">
                          <Badge 
                            className={`${categoryColors[blog.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'} border-0`}
                          >
                            {blog.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                        
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
                        
                        <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                          <span>Read More</span>
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Articles */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">All Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-500/20" />
                      <div className="absolute top-4 left-4">
                        <Badge 
                          className={`${categoryColors[blog.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'} border-0`}
                        >
                          {blog.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{blog.author}</span>
                        </div>
                        <span className="font-medium">{blog.readTime}</span>
                      </div>
                      
                      <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                        <span>Read More</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}