"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Brain,
  Calculator,
  CheckCircle,
  FileText,
  MessageSquare,
  PenTool,
  Search,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  {
    id: "ai-solutions",
    icon: Brain,
    title: "AI Solutions",
    description: "Get instant, accurate solutions to your homework problems. Our advanced AI understands context and provides step-by-step explanations for any subject.",
    image: "/placeholder-ai-solutions.png",
    color: "from-purple-500 to-blue-500",
    bgColor: "bg-purple-50",
    highlights: ["Step-by-step explanations", "95%+ accuracy", "All subjects covered"],
  },
  {
    id: "essay-writer",
    icon: PenTool,
    title: "AI Essay Writer",
    description: "Generate well-structured essays with proper citations and formatting. Perfect for research papers, reports, and creative writing assignments.",
    image: "/placeholder-essay-writer.png",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    highlights: ["Auto citations", "Plagiarism-free", "Multiple formats"],
  },
  {
    id: "math-solver",
    icon: Calculator,
    title: "Math Solver",
    description: "Solve complex mathematical problems with detailed step-by-step solutions. From algebra to calculus, get the help you need.",
    image: "/placeholder-math-solver.png",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    highlights: ["Graph plotting", "Multiple methods", "Formula library"],
  },
  {
    id: "ai-chat",
    icon: MessageSquare,
    title: "AI Chat",
    description: "Get personalized answers to your questions with AI-powered responses. Interactive learning with instant feedback.",
    image: "/placeholder-ai-chat.png",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    highlights: ["24/7 availability", "Follow-up questions", "Concept explanations"],
  },
  {
    id: "citation-generator",
    icon: FileText,
    title: "Citation Generator",
    description: "Create accurate citations in APA, MLA, Chicago, and Harvard formats. Never worry about formatting again.",
    image: "/placeholder-citations.png",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    highlights: ["Multiple formats", "Auto detection", "Bibliography export"],
  },
  {
    id: "plagiarism-checker",
    icon: Search,
    title: "Plagiarism Checker",
    description: "Comprehensive plagiarism detection with detailed similarity reports. Ensure your work is original and properly cited.",
    image: "/placeholder-plagiarism.png",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    highlights: ["Deep scan", "Source identification", "Detailed reports"],
  },
];

export default function HowItWorks() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-purple-200/50 shadow-sm mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">More than Homework Help</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Powerful AI Tools for Learning
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to succeed academically, all in one place.
            From instant solutions to comprehensive study tools.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300",
                activeFeature.id === feature.id
                  ? `bg-gradient-to-r ${feature.color} text-white shadow-lg shadow-purple-500/20`
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              )}
            >
              <feature.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{feature.title}</span>
            </button>
          ))}
        </div>

        {/* Feature Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-2">
            {/* Left - Description */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${activeFeature.color} rounded-2xl mb-6 shadow-lg`}>
                <activeFeature.icon className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {activeFeature.title}
              </h3>

              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {activeFeature.description}
              </p>

              {/* Highlights */}
              <div className="space-y-3 mb-8">
                {activeFeature.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${activeFeature.color} flex items-center justify-center`}>
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className={`w-fit bg-gradient-to-r ${activeFeature.color} hover:opacity-90 text-white px-8 py-6 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]`}
              >
                <Link href={`/tools/${activeFeature.id}`}>
                  Try {activeFeature.title}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Right - Image/Visual */}
            <div className={`${activeFeature.bgColor} p-8 lg:p-12 flex items-center justify-center`}>
              <div className="relative w-full max-w-md aspect-square rounded-2xl bg-white shadow-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${activeFeature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <activeFeature.icon className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-gray-500 font-medium">{activeFeature.title} Preview</p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${activeFeature.color}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Try Free CTA */}
        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-6 rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]"
          >
            <Link href="/register">
              Try Free Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}