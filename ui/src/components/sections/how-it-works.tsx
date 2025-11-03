import { Upload, Brain, CheckCircle, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Upload,
    title: "Submit Your Question",
    description: "Upload your homework question along with any supporting files or images. Our platform accepts various formats including PDFs, images, and text.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our advanced AI analyzes your question, understands the context, and applies subject-specific knowledge to generate accurate solutions.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: CheckCircle,
    title: "Get Solutions",
    description: "Receive step-by-step solutions with detailed explanations. Choose to get AI responses, humanized content, or connect with expert tutors.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: MessageSquare,
    title: "Interactive Learning",
    description: "Ask follow-up questions, request clarifications, or dive deeper into concepts with our interactive AI chat feature (premium users).",
    color: "from-orange-500 to-red-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get homework help in just a few simple steps. Our AI-powered platform 
            makes learning easier and more effective than ever before.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-linear-to-r from-gray-200 to-gray-300 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              )}

              <Card className="relative z-10 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-linear-to-r ${step.color} rounded-2xl mb-6 shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-linear-to-r from-purple-100 to-blue-100 rounded-full">
            <Brain className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium">
              Ready to experience the future of homework help?
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}