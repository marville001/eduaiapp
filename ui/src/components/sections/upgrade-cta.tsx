"use client";

import Link from "next/link";
import { Check, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  "Unlimited file uploads",
  "AI chat with subject experts",
  "Priority response time",
  "Advanced plagiarism checker",
  "Step-by-step solutions",
  "Expert tutor access",
  "Study planner & reminders",
  "Download solutions as PDF",
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "College Student",
    content: "MasomoAI Premium helped me improve my GPA from 3.2 to 3.8 in just one semester!",
    rating: 5,
  },
  {
    name: "James L.",
    role: "High School Senior",
    content: "The AI chat feature is incredible. It's like having a personal tutor 24/7.",
    rating: 5,
  },
  {
    name: "Maria R.",
    role: "Graduate Student",
    content: "The plagiarism checker and citation tools saved me hours of work on my thesis.",
    rating: 5,
  },
];

export default function UpgradeCta() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Crown className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-white font-medium">Premium Features</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Unlock Your Full
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Academic Potential
                </span>
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of successful students who have upgraded to Premium 
                and transformed their academic performance with our advanced AI tools.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">$9.99<span className="text-lg font-normal text-gray-300">/month</span></div>
                  <div className="text-gray-300">or $99/year (save 17%)</div>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 px-3 py-1">
                  Most Popular
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  asChild
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <Link href="/upgrade">
                    <Zap className="mr-2 h-5 w-5" />
                    Upgrade Now
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 py-4 rounded-lg"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-400" />
              </div>
              <span>7-day money-back guarantee • Cancel anytime</span>
            </div>
          </div>

          {/* Right Column - Testimonials */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">What Students Say</h3>
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-gray-300">4.9/5 from 10,000+ reviews</span>
              </div>
            </div>

            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-200 leading-relaxed mb-4">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-gray-300 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Trust Indicators */}
            <div className="text-center pt-6">
              <p className="text-gray-300 mb-4">Trusted by students from</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-lg font-bold text-gray-300">Harvard</div>
                <div className="text-lg font-bold text-gray-300">MIT</div>
                <div className="text-lg font-bold text-gray-300">Stanford</div>
                <div className="text-lg font-bold text-gray-300">Oxford</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}