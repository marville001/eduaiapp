"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown, Zap, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscriptionPlans, formatPrice, createCheckoutSession } from "@/lib/stripe";

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const handleUpgrade = async (planId: string, stripePriceId: string | null) => {
    if (!stripePriceId) return;
    
    setIsLoading(planId);
    
    try {
      // In a real app, you'd get the user ID from authentication context
      const userId = 'user_123'; // Mock user ID
      await createCheckoutSession(stripePriceId, userId);
    } catch (error) {
      console.error('Error upgrading:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(null);
    }
  };

  const filteredPlans = subscriptionPlans.filter(plan => 
    plan.id === 'free' || plan.interval === billingInterval
  );

  return (
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link 
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-6">
                <Crown className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-purple-800 font-medium">Upgrade to Premium</span>
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Unlock the full potential of AI-powered homework assistance. 
                Get unlimited access to advanced features and expert support.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <div className="bg-white rounded-lg p-1 shadow-md">
                <button
                  onClick={() => setBillingInterval('month')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingInterval === 'month'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('year')}
                  className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                    billingInterval === 'year'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1">
                    Save 17%
                  </Badge>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {filteredPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.isPopular 
                      ? 'border-purple-500 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">
                          /{plan.interval}
                        </span>
                      )}
                    </div>
                    {plan.interval === 'year' && (
                      <p className="text-sm text-green-600 font-medium">
                        Save {formatPrice((9.99 * 12) - plan.price)} per year
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-6">
                      {plan.id === 'free' ? (
                        <Button 
                          variant="outline" 
                          className="w-full h-12 border-2 border-gray-300"
                          disabled
                        >
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUpgrade(plan.id, plan.stripePriceId!)}
                          disabled={isLoading === plan.id}
                          className={`w-full h-12 font-semibold transition-all duration-200 ${
                            plan.isPopular
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                              : 'bg-gray-900 hover:bg-gray-800 text-white'
                          }`}
                        >
                          {isLoading === plan.id ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Zap className="h-4 w-4" />
                              <span>Upgrade Now</span>
                            </div>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="text-center mt-16">
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-gray-600">4.9/5 from 10,000+ students</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>7-day money-back guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Secure payment</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I upgrade or downgrade my plan anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your subscription at any time. 
                  Changes will be prorated and reflected in your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, MasterCard, American Express) 
                  and PayPal through our secure Stripe payment processing.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a free trial for Premium?
                </h3>
                <p className="text-gray-600">
                  Yes! We offer a 7-day free trial for new Premium subscribers. 
                  You can cancel anytime during the trial period without being charged.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}