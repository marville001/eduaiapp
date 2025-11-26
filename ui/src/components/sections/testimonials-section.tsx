"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
	{
		name: "Emily Johnson",
		role: "College Student",
		avatar: "E",
		avatarColor: "from-purple-400 to-pink-400",
		content: "MasomoAI transformed my study routine. It summarizes lectures, makes flashcards, and gives instant writing feedback. My grades improved from 3.2 to 3.8 in just one semester!",
		rating: 5,
	},
	{
		name: "David Chen",
		role: "Graduate Researcher",
		avatar: "D",
		avatarColor: "from-blue-400 to-cyan-400",
		content: "As a graduate researcher, I rely on MasomoAI daily. It helps me summarize academic papers, organize insights, and brainstorm visually. It's the ultimate academic toolkit.",
		rating: 5,
	},
	{
		name: "Sarah Williams",
		role: "High School Teacher",
		avatar: "S",
		avatarColor: "from-green-400 to-emerald-400",
		content: "MasomoAI enables me to create lesson summaries, slides, and custom test questions based on my students' needs. It saves me hours each week and has become essential to my teaching.",
		rating: 5,
	},
	{
		name: "Michael Brown",
		role: "Business Professional",
		avatar: "M",
		avatarColor: "from-orange-400 to-red-400",
		content: "Working in consulting, I use MasomoAI to grasp complex reports quickly and turn them into polished presentations. The visualization features are incredibly helpful for client meetings.",
		rating: 5,
	},
	{
		name: "Lisa Rodriguez",
		role: "Content Creator",
		avatar: "L",
		avatarColor: "from-pink-400 to-rose-400",
		content: "MasomoAI acts like my personal assistant. It summarizes videos, drafts scripts, refines my writing, and helps me brainstorm content ideas. It saves loads of time and boosts my productivity.",
		rating: 5,
	},
	{
		name: "James Thompson",
		role: "Medical Student",
		avatar: "J",
		avatarColor: "from-indigo-400 to-purple-400",
		content: "MasomoAI is my daily study companion. It simplifies tough medical topics, summarizes recordings, and creates visuals for easy learning. My studies feel more structured now.",
		rating: 5,
	},
];

export default function TestimonialsSection() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);

	useEffect(() => {
		if (!isAutoPlaying) return;

		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % testimonials.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [isAutoPlaying]);

	const handlePrev = () => {
		setIsAutoPlaying(false);
		setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
	};

	const handleNext = () => {
		setIsAutoPlaying(false);
		setActiveIndex((prev) => (prev + 1) % testimonials.length);
	};

	// Show 3 testimonials at a time on desktop
	const getVisibleTestimonials = () => {
		const visible = [];
		for (let i = 0; i < 3; i++) {
			const index = (activeIndex + i) % testimonials.length;
			visible.push({ ...testimonials[index], originalIndex: index });
		}
		return visible;
	};

	return (
		<section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Real Stories, Real Results
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						See how students and professionals are achieving their goals with MasomoAI.
					</p>

					{/* Rating Summary */}
					<div className="flex items-center justify-center gap-2 mt-6">
						<div className="flex">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
							))}
						</div>
						<span className="text-gray-600 font-medium">4.9/5 from 10,000+ reviews</span>
					</div>
				</div>

				{/* Testimonials Carousel */}
				<div className="relative">
					{/* Desktop View - 3 Cards */}
					<div className="hidden lg:grid lg:grid-cols-3 gap-6">
						{getVisibleTestimonials().map((testimonial, index) => (
							<div
								key={testimonial.originalIndex}
								className={cn(
									"bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-500",
									index === 1 && "scale-105 shadow-xl border-purple-200"
								)}
							>
								<Quote className="h-8 w-8 text-purple-200 mb-4" />

								<div className="flex mb-4">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
									))}
								</div>

								<p className="text-gray-700 leading-relaxed mb-6">
									&quot;{testimonial.content}&quot;
								</p>

								<div className="flex items-center gap-3">
									<div className={cn(
										"w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center",
										testimonial.avatarColor
									)}>
										<span className="text-white font-bold text-lg">
											{testimonial.avatar}
										</span>
									</div>
									<div>
										<div className="font-semibold text-gray-900">{testimonial.name}</div>
										<div className="text-gray-500 text-sm">{testimonial.role}</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Mobile View - Single Card */}
					<div className="lg:hidden">
						<div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
							<Quote className="h-8 w-8 text-purple-200 mb-4" />

							<div className="flex mb-4">
								{[...Array(testimonials[activeIndex].rating)].map((_, i) => (
									<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
								))}
							</div>

							<p className="text-gray-700 leading-relaxed mb-6">
								&quot;{testimonials[activeIndex].content}&quot;
							</p>

							<div className="flex items-center gap-3">
								<div className={cn(
									"w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center",
									testimonials[activeIndex].avatarColor
								)}>
									<span className="text-white font-bold text-lg">
										{testimonials[activeIndex].avatar}
									</span>
								</div>
								<div>
									<div className="font-semibold text-gray-900">{testimonials[activeIndex].name}</div>
									<div className="text-gray-500 text-sm">{testimonials[activeIndex].role}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<div className="flex items-center justify-center gap-4 mt-8">
						<Button
							variant="outline"
							size="icon"
							onClick={handlePrev}
							className="rounded-full border-gray-300 hover:border-purple-300 hover:bg-purple-50"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>

						{/* Dots */}
						<div className="flex gap-2">
							{testimonials.map((_, index) => (
								<button
									key={index}
									onClick={() => {
										setIsAutoPlaying(false);
										setActiveIndex(index);
									}}
									className={cn(
										"w-2 h-2 rounded-full transition-all duration-300",
										index === activeIndex
											? "w-6 bg-purple-600"
											: "bg-gray-300 hover:bg-gray-400"
									)}
								/>
							))}
						</div>

						<Button
							variant="outline"
							size="icon"
							onClick={handleNext}
							className="rounded-full border-gray-300 hover:border-purple-300 hover:bg-purple-50"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
