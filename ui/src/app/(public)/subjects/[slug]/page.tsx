import { notFound } from "next/navigation";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import AiChatForm from "@/components/forms/ai-chat-form";
import { Calculator, Atom, Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock subject data - in real app, this would come from database/API
const subjects = {
  mathematics: {
    name: "Mathematics",
    icon: Calculator,
    description: "Master mathematical concepts from basic arithmetic to advanced calculus with AI-powered step-by-step solutions.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    topics: [
      "Algebra", "Calculus", "Geometry", "Statistics",
      "Trigonometry", "Linear Algebra", "Differential Equations", "Number Theory"
    ],
    aiPrompt: "You are a mathematics tutor. Provide clear, step-by-step solutions with detailed explanations for mathematical problems.",
    relatedSubjects: ["physics", "computer-science", "statistics"],
  },
  physics: {
    name: "Physics",
    icon: Atom,
    description: "Explore the fundamental laws of nature with comprehensive physics problem-solving assistance.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    topics: [
      "Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Physics",
      "Optics", "Waves", "Nuclear Physics", "Relativity"
    ],
    aiPrompt: "You are a physics tutor. Explain physics concepts clearly with real-world examples and solve problems step-by-step.",
    relatedSubjects: ["mathematics", "chemistry", "engineering"],
  },
  chemistry: {
    name: "Chemistry",
    icon: Atom,
    description: "Understand chemical reactions, molecular structures, and laboratory techniques with expert guidance.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    topics: [
      "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry",
      "Analytical Chemistry", "Chemical Bonding", "Thermochemistry", "Kinetics"
    ],
    aiPrompt: "You are a chemistry tutor. Provide detailed explanations of chemical concepts and solve chemistry problems systematically.",
    relatedSubjects: ["physics", "biology", "mathematics"],
  },
  "computer-science": {
    name: "Computer Science",
    icon: Code,
    description: "Learn programming, algorithms, data structures, and software development with hands-on examples.",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    topics: [
      "Programming", "Data Structures", "Algorithms", "Database Systems",
      "Software Engineering", "Machine Learning", "Web Development", "Cybersecurity"
    ],
    aiPrompt: "You are a computer science tutor. Provide clear code examples and explain programming concepts with practical applications.",
    relatedSubjects: ["mathematics", "logic", "engineering"],
  },
};

interface SubjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { slug } = await params;
  const subject = subjects[slug as keyof typeof subjects];

  if (!subject) {
    notFound();
  }

  return (
    <main>

      {/* AI Chat Section */}
      <section className="py-20 bg-linear-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get {subject.name} Help Now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Submit your {subject.name.toLowerCase()} questions and get instant,
              accurate solutions with step-by-step explanations.
            </p>
          </div>

          <AiChatForm />
        </div>
      </section>

      {/* Related Subjects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Related Subjects
            </h2>
            <p className="text-gray-600">
              Explore other subjects that complement your {subject.name.toLowerCase()} studies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subject.relatedSubjects.map((relatedSlug) => {
              const relatedSubject = subjects[relatedSlug as keyof typeof subjects];
              if (!relatedSubject) return null;

              const RelatedIcon = relatedSubject.icon;

              return (
                <Card key={relatedSlug} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <CardContent className={`p-6 ${relatedSubject.bgColor}`}>
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-linear-to-r ${relatedSubject.color} rounded-xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <RelatedIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {relatedSubject.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {relatedSubject.description.substring(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

// Generate static params for known subjects
export async function generateStaticParams() {
  return Object.keys(subjects).map((slug) => ({
    slug,
  }));
}