"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Briefcase, GraduationCap, Lightbulb, Palette } from "lucide-react";

const personas = [
	{
		icon: GraduationCap,
		title: "Students",
		description: "Master content faster, generate notes and flashcards, and receive writing suggestions. Make study, assignments, and exams more efficient.",
		color: "from-purple-500 to-blue-500",
		bgColor: "bg-purple-50",
		iconBg: "bg-purple-100",
		features: ["Instant homework help", "Study guides", "Exam preparation"],
	},
	{
		icon: BookOpen,
		title: "Researchers",
		description: "Summarize papers, build research structures, and write proposals and reports more efficiently with detailed AI-powered insights.",
		color: "from-blue-500 to-cyan-500",
		bgColor: "bg-blue-50",
		iconBg: "bg-blue-100",
		features: ["Paper summaries", "Research organization", "Citation help"],
	},
	{
		icon: Lightbulb,
		title: "Educators",
		description: "Extract key points, create teaching materials, and customize content and quizzes. Enhance the learning experience for your students.",
		color: "from-green-500 to-emerald-500",
		bgColor: "bg-green-50",
		iconBg: "bg-green-100",
		features: ["Lesson planning", "Quiz generation", "Content creation"],
	},
	{
		icon: Briefcase,
		title: "Professionals",
		description: "Read reports efficiently, visualize ideas, and quickly create proposals, briefs, and reports with AI assistance for better writing.",
		color: "from-orange-500 to-amber-500",
		bgColor: "bg-orange-50",
		iconBg: "bg-orange-100",
		features: ["Report analysis", "Presentation help", "Writing assistance"],
	},
	{
		icon: Palette,
		title: "Creators",
		description: "Summarize content for inspiration, visualize ideas, generate scripts, and manage creative notes and materials efficiently.",
		color: "from-pink-500 to-rose-500",
		bgColor: "bg-pink-50",
		iconBg: "bg-pink-100",
		features: ["Content inspiration", "Script writing", "Idea management"],
	},
];

export default function DesignedForSection() {
	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Designed for You
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Whether you&apos;re a student, researcher, educator, or professional,
						our AI tools are tailored to help you achieve your goals.
					</p>
				</div>

				{/* Personas Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
					{personas.map((persona, index) => (
						<div
							key={index}
							className={cn(
								"group relative rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100",
								persona.bgColor
							)}
						>
							{/* Icon */}
							<div className={cn(
								"inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110",
								`bg-gradient-to-r ${persona.color}`
							)}>
								<persona.icon className="h-7 w-7 text-white" />
							</div>

							{/* Content */}
							<h3 className="text-xl font-bold text-gray-900 mb-3">
								{persona.title}
							</h3>
							<p className="text-gray-600 leading-relaxed text-sm mb-4">
								{persona.description}
							</p>

							{/* Features */}
							<div className="space-y-2">
								{persona.features.map((feature, idx) => (
									<div key={idx} className="flex items-center gap-2 text-sm">
										<div className={cn(
											"w-1.5 h-1.5 rounded-full",
											`bg-gradient-to-r ${persona.color}`
										)} />
										<span className="text-gray-600">{feature}</span>
									</div>
								))}
							</div>

							{/* Hover gradient border */}
							<div className={cn(
								"absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
								"bg-gradient-to-r p-[2px]",
								persona.color
							)}>
								<div className={cn("w-full h-full rounded-2xl", persona.bgColor)} />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
