"use client";

import Link from "next/link";
import { PenTool, FileText, CheckCircle, Search, Calculator, Calendar, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tools = [
  {
    name: "AI Essay Writer",
    slug: "essay-writer",
    icon: PenTool,
    description: "Generate well-structured essays with proper citations and formatting",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    features: ["Auto Citations", "Plagiarism Check", "Multiple Formats"],
    isPremium: false,
  },
  {
    name: "Citation Generator",
    slug: "citation-generator",
    icon: FileText,
    description: "Create accurate citations in APA, MLA, Chicago, and Harvard formats",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    features: ["Multiple Formats", "Auto Detection", "Bibliography"],
    isPremium: false,
  },
  {
    name: "Grammar Checker",
    slug: "grammar-checker",
    icon: CheckCircle,
    description: "Advanced grammar and style checking with improvement suggestions",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    features: ["Style Suggestions", "Tone Analysis", "Readability"],
    isPremium: false,
  },
  {
    name: "Plagiarism Checker",
    slug: "plagiarism-checker",
    icon: Search,
    description: "Comprehensive plagiarism detection with detailed similarity reports",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    features: ["Deep Scan", "Source Identification", "Similarity %"],
    isPremium: true,
  },
  {
    name: "Math Solver",
    slug: "math-solver",
    icon: Calculator,
    description: "Step-by-step solutions for algebra, calculus, and advanced math",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    features: ["Step-by-Step", "Graph Plotting", "Multiple Methods"],
    isPremium: true,
  },
  {
    name: "Study Planner",
    slug: "study-planner",
    icon: Calendar,
    description: "AI-powered study schedules and personalized learning plans",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    features: ["Smart Scheduling", "Progress Tracking", "Reminders"],
    isPremium: true,
  },
];

export default function AiToolsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-6">
            <Zap className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium">AI-Powered Tools</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Study Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your learning experience with our comprehensive suite of AI-powered 
            academic tools designed to boost your productivity and academic success.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tools.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`}>
              <Card className="group h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
                <CardContent className={`p-0 h-full ${tool.bgColor}`}>
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      {tool.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          Premium
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="px-6 pb-6">
                    <div className="space-y-2">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`px-6 py-4 bg-gradient-to-r ${tool.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {tool.isPremium ? "Premium Feature" : "Free to Use"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-gray-800 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to supercharge your studies?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of students who are already using our AI tools to improve 
            their academic performance and save time on assignments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold"
            >
              Try Tools Free
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-lg font-semibold"
            >
              View All Tools
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}