import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mock blog data - in real app, this would come from database/API
const blogs = {
  "proven-study-techniques-that-work": {
    id: "1",
    title: "10 Proven Study Techniques That Actually Work",
    slug: "proven-study-techniques-that-work",
    content: `
      <p>Studying effectively is a skill that can be learned and improved over time. Research in cognitive psychology has identified several evidence-based techniques that can significantly enhance your learning and retention. Here are 10 proven study methods that top students use to achieve academic success.</p>

      <h2>1. Spaced Repetition</h2>
      <p>Instead of cramming all your studying into one session, space out your review sessions over time. This technique leverages the psychological spacing effect, where information is better retained when learning sessions are spread out.</p>

      <h2>2. Active Recall</h2>
      <p>Rather than passively re-reading notes, actively test yourself on the material. This forces your brain to retrieve information, strengthening neural pathways and improving long-term retention.</p>

      <h2>3. The Feynman Technique</h2>
      <p>Explain concepts in simple terms as if teaching someone else. This technique helps identify gaps in your understanding and ensures you truly comprehend the material.</p>

      <h2>4. Interleaving</h2>
      <p>Mix different types of problems or subjects within a single study session. This approach improves your ability to distinguish between different concepts and apply the right strategy.</p>

      <h2>5. Elaborative Interrogation</h2>
      <p>Ask yourself "why" and "how" questions about the material. This deeper level of processing helps create more meaningful connections and improves understanding.</p>

      <h2>6. Dual Coding</h2>
      <p>Combine verbal and visual information when studying. Use diagrams, charts, and mind maps alongside text to engage both verbal and visual processing systems.</p>

      <h2>7. Testing Effect</h2>
      <p>Regular self-testing is more effective than repeated studying. Practice tests and quizzes help consolidate knowledge and identify areas that need more attention.</p>

      <h2>8. Distributed Practice</h2>
      <p>Break study sessions into shorter, more frequent periods rather than long, infrequent ones. This approach reduces fatigue and improves focus.</p>

      <h2>9. Concrete Examples</h2>
      <p>Use specific, real-world examples to illustrate abstract concepts. This makes information more memorable and easier to understand.</p>

      <h2>10. Metacognitive Strategies</h2>
      <p>Think about your thinking. Monitor your understanding, plan your approach, and evaluate your progress. This self-awareness improves learning efficiency.</p>

      <h2>Conclusion</h2>
      <p>Implementing these evidence-based study techniques can dramatically improve your academic performance. Start with one or two methods and gradually incorporate others as they become habitual. Remember, effective studying is about quality, not quantity.</p>
    `,
    excerpt: "Discover evidence-based study methods that can improve your learning efficiency and academic performance.",
    featuredImage: "/api/placeholder/800/400",
    category: "Study Tips",
    author: "Dr. Sarah Johnson",
    publishedAt: "2024-01-15",
    readTime: "5 min read",
    tags: ["study techniques", "learning", "academic success", "cognitive psychology"],
  },
  "ai-revolutionizing-education-2024": {
    id: "2",
    title: "How AI is Revolutionizing Education in 2024",
    slug: "ai-revolutionizing-education-2024",
    content: `
      <p>Artificial Intelligence is transforming the educational landscape at an unprecedented pace. From personalized learning experiences to automated grading systems, AI technologies are reshaping how students learn and teachers educate.</p>

      <h2>Personalized Learning Paths</h2>
      <p>AI algorithms can analyze individual learning patterns and adapt content delivery to match each student's pace and style. This personalization ensures that no student is left behind while challenging advanced learners appropriately.</p>

      <h2>Intelligent Tutoring Systems</h2>
      <p>AI-powered tutoring systems provide 24/7 support, offering immediate feedback and guidance. These systems can identify knowledge gaps and provide targeted interventions to help students master difficult concepts.</p>

      <h2>Automated Assessment and Feedback</h2>
      <p>AI can grade assignments, provide detailed feedback, and even detect plagiarism. This automation frees up teachers' time for more meaningful interactions with students.</p>

      <h2>The Future of AI in Education</h2>
      <p>As AI technology continues to evolve, we can expect even more innovative applications in education, from virtual reality classrooms to AI-generated educational content.</p>
    `,
    excerpt: "Explore the latest AI technologies transforming how students learn and teachers educate in the digital age.",
    featuredImage: "/api/placeholder/800/400",
    category: "Technology",
    author: "Prof. Michael Chen",
    publishedAt: "2024-01-12",
    readTime: "7 min read",
    tags: ["artificial intelligence", "education technology", "personalized learning", "future of education"],
  },
};

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = blogs[slug as keyof typeof blogs];

  if (!blog) {
    notFound();
  }

  const categoryColors = {
    "Study Tips": "bg-blue-100 text-blue-800",
    "Technology": "bg-purple-100 text-purple-800",
    "Mathematics": "bg-green-100 text-green-800",
    "Science": "bg-orange-100 text-orange-800",
    "Languages": "bg-pink-100 text-pink-800",
    "College Life": "bg-indigo-100 text-indigo-800",
    "Learning": "bg-yellow-100 text-yellow-800",
  };

  return (
      <main>
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link 
              href="/blog"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <div className="mb-8">
              <Badge 
                className={`${categoryColors[blog.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'} border-0 mb-4`}
              >
                {blog.category}
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {blog.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-6">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{blog.readTime}</span>
                </div>
              </div>

              {/* Share Button */}
              <Button variant="outline" className="mb-8">
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
            </div>

            {/* Featured Image */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl overflow-hidden mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-purple-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <Card className="mt-12 border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {blog.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.author}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Educational expert and researcher with over 10 years of experience in 
                      cognitive psychology and learning sciences. Passionate about helping 
                      students achieve their academic goals through evidence-based methods.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Badge className="bg-blue-100 text-blue-800 border-0 mb-3">
                      Study Tips
                    </Badge>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      The Science of Effective Note-Taking
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Research-backed methods for taking notes that enhance comprehension and retention.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Badge className="bg-green-100 text-green-800 border-0 mb-3">
                      Learning
                    </Badge>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Understanding Different Learning Styles
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Discover your learning style and adapt your study methods accordingly.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}

// Generate static params for known blog posts
export async function generateStaticParams() {
  return Object.keys(blogs).map((slug) => ({
    slug,
  }));
}