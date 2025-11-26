"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
	{
		name: "Free Plan",
		icon: Sparkles,
		description: "Perfect for getting started",
		price: "Free",
		period: "",
		features: [
			"15 questions per month",
			"Basic AI solutions",
			"Step-by-step explanations",
			"Access to all subjects",
		],
		cta: "Try Free Now",
		ctaLink: "/register",
		popular: false,
		gradient: "from-gray-500 to-gray-600",
		bgColor: "bg-gray-50",
	},
	{
		name: "Premium Plan",
		icon: Zap,
		description: "Best for individual learners",
		price: "$9.99",
		period: "/month",
		originalPrice: "$19.99",
		discount: "50% OFF",
		features: [
			"Unlimited questions",
			"Advanced AI solutions",
			"AI Chat with tutors",
			"Priority support",
			"Plagiarism checker",
			"Essay writer & tools",
			"Download as PDF",
		],
		cta: "Upgrade Now",
		ctaLink: "/pricing",
		popular: true,
		gradient: "from-purple-600 to-blue-600",
		bgColor: "bg-gradient-to-br from-purple-50 to-blue-50",
	},
	{
		name: "Team Plan",
		icon: Crown,
		description: "Perfect for groups & schools",
		price: "Custom",
		period: "",
		features: [
			"Everything in Premium",
			"Multiple user accounts",
			"Team collaboration",
			"Admin dashboard",
			"Priority onboarding",
			"Dedicated support",
		],
		cta: "Contact Sales",
		ctaLink: "/contact",
		popular: false,
		gradient: "from-orange-500 to-amber-500",
		bgColor: "bg-orange-50",
	},
];

export default function PricingSection() {
	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Powerful Features, Affordable Plans
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Start free and upgrade when you need more. All plans include access to our core AI features.
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{plans.map((plan, index) => (
						<div
							key={index}
							className={cn(
								"relative rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl border-2",
								plan.popular
									? "border-purple-300 shadow-xl scale-105 z-10"
									: "border-gray-200 hover:border-purple-200"
							)}
						>
							{/* Popular Badge */}
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
										Most Popular
									</div>
								</div>
							)}

							{/* Plan Icon */}
							<div className={cn(
								"inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6 bg-gradient-to-r",
								plan.gradient
							)}>
								<plan.icon className="h-6 w-6 text-white" />
							</div>

							{/* Plan Name & Description */}
							<h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
							<p className="text-gray-600 mb-6">{plan.description}</p>

							{/* Price */}
							<div className="mb-6">
								<div className="flex items-baseline gap-2">
									<span className="text-4xl font-bold text-gray-900">{plan.price}</span>
									{plan.period && <span className="text-gray-600">{plan.period}</span>}
								</div>
								{plan.originalPrice && (
									<div className="flex items-center gap-2 mt-1">
										<span className="text-gray-400 line-through">{plan.originalPrice}</span>
										<span className="text-green-600 font-semibold text-sm">{plan.discount}</span>
									</div>
								)}
							</div>

							{/* Features */}
							<ul className="space-y-4 mb-8">
								{plan.features.map((feature, idx) => (
									<li key={idx} className="flex items-start gap-3">
										<div className={cn(
											"w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-r",
											plan.gradient
										)}>
											<Check className="h-3 w-3 text-white" />
										</div>
										<span className="text-gray-700">{feature}</span>
									</li>
								))}
							</ul>

							{/* CTA Button */}
							<Button
								asChild
								size="lg"
								className={cn(
									"w-full py-6 rounded-xl font-semibold text-lg transition-all duration-300",
									plan.popular
										? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25"
										: "bg-gray-100 hover:bg-gray-200 text-gray-900"
								)}
							>
								<Link href={plan.ctaLink}>
									{plan.cta}
								</Link>
							</Button>
						</div>
					))}
				</div>

				{/* Trust Note */}
				<div className="text-center mt-12">
					<p className="text-gray-600 flex items-center justify-center gap-2">
						<Check className="h-5 w-5 text-green-500" />
						7-day money-back guarantee • Cancel anytime • No credit card required for free plan
					</p>
				</div>
			</div>
		</section>
	);
}
