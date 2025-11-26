"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FinalCtaSection() {
	return (
		<section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10" />
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10" />
			</div>

			{/* Grid pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute inset-0" style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
				}} />
			</div>

			<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<div className="space-y-8">
					{/* Icon */}
					<div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
						<Sparkles className="h-8 w-8 text-white" />
					</div>

					{/* Heading */}
					<h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
						Learn Smarter and Faster,
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
							Not Harder
						</span>
					</h2>

					{/* Subtitle */}
					<p className="text-xl text-white/80 max-w-2xl mx-auto">
						Join thousands of students who are transforming their academic journey with AI-powered learning tools.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Button
							asChild
							size="lg"
							className="bg-white text-purple-700 hover:bg-gray-100 px-10 py-6 rounded-xl font-semibold text-lg shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
							className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all duration-300"
						>
							<Link href="/pricing">
								View Pricing
							</Link>
						</Button>
					</div>

					{/* Trust indicators */}
					<div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-white/70">
						<div className="flex items-center gap-2">
							<span className="text-green-300">✓</span>
							<span>No credit card required</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-green-300">✓</span>
							<span>15 free questions</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-green-300">✓</span>
							<span>Cancel anytime</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
