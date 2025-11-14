import AiChatForm from "@/components/forms/ai-chat-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Suspense } from 'react';

const features = [
  "Instant AI-powered solutions",
  "Step-by-step explanations",
  "Multiple subject coverage",
  "24/7 availability",
];

export default function HeroSection() {

  return (
    <section className="relative min-h-screen  overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                AI Homework Helper for{" "}
                <span className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Quick, Accurate,
                </span>{" "}
                and Stress-Free Solutions
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Get instant help with your homework across all subjects. Our AI-powered platform
                provides step-by-step solutions, explanations, and expert guidance to help you
                succeed academically.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 px-8 py-4 rounded-lg font-semibold"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Column - AI Chat Form */}
          <div className="lg:pl-8">
            <Suspense fallback={<div>Loading...</div>}>
              <AiChatForm />
            </Suspense>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">Trusted by students from</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-lg font-bold text-gray-400">Harvard</div>
                <div className="text-lg font-bold text-gray-400">MIT</div>
                <div className="text-lg font-bold text-gray-400">Stanford</div>
                <div className="text-lg font-bold text-gray-400">Oxford</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}