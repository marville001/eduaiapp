"use client";

import { Users } from "lucide-react";

const avatars = [
	{ name: "User 1", color: "from-purple-400 to-pink-400" },
	{ name: "User 2", color: "from-blue-400 to-cyan-400" },
	{ name: "User 3", color: "from-green-400 to-emerald-400" },
	{ name: "User 4", color: "from-orange-400 to-red-400" },
	{ name: "User 5", color: "from-indigo-400 to-purple-400" },
];

const logos = [
	"Harvard", "MIT", "Stanford", "Oxford", "Yale",
	"Cambridge", "Princeton", "Columbia", "Berkeley", "UCLA"
];

export default function SocialProofSection() {
	return (
		<section className="py-12 bg-white border-y border-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Stats and Avatars */}
				<div className="flex flex-col items-center justify-center gap-6 mb-12">
					<div className="flex items-center gap-4">
						{/* Overlapping Avatars */}
						<div className="flex -space-x-3">
							{avatars.map((avatar, index) => (
								<div
									key={index}
									className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.color} border-2 border-white shadow-md flex items-center justify-center`}
									style={{ zIndex: avatars.length - index }}
								>
									<span className="text-white text-xs font-semibold">
										{avatar.name.charAt(0)}
									</span>
								</div>
							))}
						</div>

						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-purple-600" />
							<span className="text-gray-600">
								<span className="font-bold text-gray-900">50,000+</span> Students Worldwide
							</span>
						</div>
					</div>

					<h3 className="text-xl font-semibold text-gray-900">
						Loved by Students from Top Universities
					</h3>
				</div>

				{/* Logo Marquee */}
				<div className="relative overflow-hidden">
					{/* Gradient Overlays */}
					<div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
					<div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

					{/* Scrolling Logos */}
					<div className="flex animate-marquee">
						{[...logos, ...logos].map((logo, index) => (
							<div
								key={index}
								className="flex-shrink-0 mx-8 flex items-center justify-center"
							>
								<div className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-300">
									<span className="text-lg font-bold text-gray-400 hover:text-purple-600 transition-colors">
										{logo}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
		</section>
	);
}
