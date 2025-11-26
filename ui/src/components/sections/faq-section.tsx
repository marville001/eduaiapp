"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import Link from 'next/link';

const faqs = [
  {
    question: "How does the AI homework helper work?",
    answer: "Our AI analyzes your homework questions using advanced natural language processing and machine learning. It understands the context, subject matter, and requirements to provide accurate, step-by-step solutions with detailed explanations."
  },
  {
    question: "What subjects are supported?",
    answer: "We support over 100+ subjects including Mathematics, Sciences (Physics, Chemistry, Biology), Languages, Computer Science, Business, Psychology, and many more. Our AI is trained on diverse academic content to handle questions across all educational levels."
  },
  {
    question: "Is there a limit to file uploads?",
    answer: "Free users can upload 1 file per question. Premium subscribers can upload multiple files and have access to higher file size limits. Supported formats include PDF, DOC, TXT, and common image formats."
  },
  {
    question: "How accurate are the AI solutions?",
    answer: "Our AI maintains a 95%+ accuracy rate across all subjects. Solutions are generated using verified academic sources and are continuously improved through machine learning. For complex problems, you can also request expert human review."
  },
  {
    question: "What's the difference between free and premium?",
    answer: "Free users get 15 questions per month with basic AI solutions. Premium users enjoy unlimited questions, AI chat functionality, priority support, advanced tools like plagiarism checker, and access to expert tutors."
  },
  {
    question: "Can I get help with exam preparation?",
    answer: "Absolutely! Our platform offers study planners, practice questions, concept explanations, and personalized learning paths. Premium users get access to comprehensive exam prep tools and one-on-one tutoring sessions."
  },
  {
    question: "How quickly will I receive answers?",
    answer: "AI-generated solutions are typically provided within 2 minutes. For expert human review or complex problems requiring additional research, responses may take 15-30 minutes depending on the complexity and current demand."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes, we take privacy seriously. All uploaded content is encrypted, stored securely, and never shared with third parties. You can delete your questions and files at any time, and we comply with all major data protection regulations."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your premium subscription at any time from your account settings. You'll continue to have access to premium features until the end of your current billing period, and no future charges will be made."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 7-day money-back guarantee for new premium subscribers. If you're not satisfied with our service within the first week, contact our support team for a full refund."
  }
];

export default function FaqSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-purple-200/50 shadow-sm mb-6">
            <HelpCircle className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">FAQ</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our AI homework helper platform,
            features, and subscription plans.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-gray-200 rounded-2xl px-6 py-1 hover:border-purple-200 hover:shadow-md transition-all duration-300 data-[state=open]:border-purple-300 data-[state=open]:shadow-lg"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-purple-700 py-5 [&[data-state=open]]:text-purple-700 [&>svg]:hidden">
                  <span className="flex-1 pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pb-5 pt-0">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            We&apos;re here to help! Contact our support team for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@MasomoAI.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              Contact Support
            </a>
            <Link
              href="/help"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-purple-200 hover:bg-purple-50 transition-all duration-300"
            >
              Visit Help Center
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}