"use client";

import Link from "next/link";
import { Calculator, Atom, Globe, Palette, Code, Brain, BookOpen, TrendingUp, Music, Microscope, Gavel, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subjects = [
  {
    name: "Mathematics",
    slug: "mathematics",
    icon: Calculator,
    description: "Algebra, Calculus, Geometry, Statistics",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    students: "15K+",
  },
  {
    name: "Sciences",
    slug: "sciences",
    icon: Atom,
    description: "Physics, Chemistry, Biology, Earth Science",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    students: "12K+",
  },
  {
    name: "Languages",
    slug: "languages",
    icon: Globe,
    description: "English, Spanish, French, Literature",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    students: "8K+",
  },
  {
    name: "Arts & Design",
    slug: "arts-design",
    icon: Palette,
    description: "Visual Arts, Graphic Design, Art History",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    students: "5K+",
  },
  {
    name: "Technology",
    slug: "technology",
    icon: Code,
    description: "Computer Science, Programming, Web Dev",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    students: "10K+",
  },
  {
    name: "Psychology",
    slug: "psychology",
    icon: Brain,
    description: "Cognitive, Social, Developmental Psychology",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    students: "6K+",
  },
  {
    name: "Literature",
    slug: "literature",
    icon: BookOpen,
    description: "Classic Literature, Poetry, Creative Writing",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50",
    students: "7K+",
  },
  {
    name: "Business",
    slug: "business",
    icon: TrendingUp,
    description: "Economics, Finance, Marketing, Management",
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50",
    students: "9K+",
  },
  {
    name: "Music",
    slug: "music",
    icon: Music,
    description: "Music Theory, Composition, History",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
    students: "3K+",
  },
  {
    name: "Biology",
    slug: "biology",
    icon: Microscope,
    description: "Cell Biology, Genetics, Ecology, Anatomy",
    color: "from-lime-500 to-green-500",
    bgColor: "bg-lime-50",
    students: "11K+",
  },
  {
    name: "Law",
    slug: "law",
    icon: Gavel,
    description: "Constitutional Law, Criminal Law, Civil Rights",
    color: "from-slate-500 to-gray-500",
    bgColor: "bg-slate-50",
    students: "4K+",
  },
  {
    name: "Medicine",
    slug: "medicine",
    icon: Heart,
    description: "Anatomy, Physiology, Pharmacology",
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
    students: "8K+",
  },
];

export default function SubjectsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Subjects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get expert help across all academic subjects. Our AI tutors are trained 
            in diverse fields to provide accurate, subject-specific assistance.
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {subjects.map((subject) => (
            <Link key={subject.slug} href={`/subjects/${subject.slug}`}>
              <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                <CardContent className={`p-6 ${subject.bgColor} h-full flex flex-col`}>
                  {/* Icon and Students Count */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${subject.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <subject.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700">{subject.students}</div>
                      <div className="text-xs text-gray-500">students</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {subject.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`h-1 bg-gradient-to-r ${subject.color} rounded-full`}></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <Link href="/subjects">
              View All Subjects
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">100+</div>
            <div className="text-gray-600">Subjects Covered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
            <div className="text-gray-600">Students Helped</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">1M+</div>
            <div className="text-gray-600">Questions Solved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600">AI Availability</div>
          </div>
        </div>
      </div>
    </section>
  );
}