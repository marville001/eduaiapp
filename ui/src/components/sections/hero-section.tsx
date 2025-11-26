"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200/50 shadow-sm">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Your All-in-One AI Learning Assistant</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              AI Homework Helper for{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Quick, Accurate,
              </span>{" "}
              <br className="hidden sm:block" />
              and Stress-Free Solutions
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Get instant help with your homework across all subjects. Step-by-step solutions,
              detailed explanations, and expert guidance to help you succeed academically.
              Boost your learning efficiency by 10x.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]"
            >
              <Link href="/register">
                Try Free Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50 px-8 py-6 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              <Link href="/demo">
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative w-full max-w-5xl mt-12">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-gray-200/50 bg-gradient-to-br from-purple-100 via-blue-50 to-white">
              {/* Placeholder for hero image - replace with actual image */}
              <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 p-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">AI Learning Platform Preview</p>
                </div>
              </div>

              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* Floating elements */}
            <div className="absolute -left-4 lg:-left-8 top-1/4 hidden sm:block">
              <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Step-by-step solutions</span>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 lg:-right-8 top-1/3 hidden sm:block">
              <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-float animation-delay-1000">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🎯</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">95%+ accuracy</span>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 lg:-right-4 bottom-1/4 hidden sm:block">
              <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-float animation-delay-2000">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">⚡</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">24/7 available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </section>
  );
}