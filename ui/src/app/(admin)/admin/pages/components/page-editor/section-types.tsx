"use client";

import { PageSectionType } from "@/lib/api/page.api";
import {
	FileText,
	Grid3X3,
	HelpCircle,
	LucideIcon,
	MessageSquare,
	MousePointerClick,
	Quote,
	Sparkles,
	Zap,
} from "lucide-react";

export interface SectionTypeConfig {
	type: PageSectionType;
	label: string;
	description: string;
	icon: LucideIcon;
	color: string;
	bgColor: string;
}

export const SECTION_TYPES: SectionTypeConfig[] = [
	{
		type: PageSectionType.RICH_TEXT,
		label: "Rich Text",
		description: "Formatted text content with headings, lists, and more",
		icon: FileText,
		color: "text-blue-600",
		bgColor: "bg-blue-50",
	},
	{
		type: PageSectionType.GRID,
		label: "Grid Section",
		description: "Display items in a responsive grid layout",
		icon: Grid3X3,
		color: "text-purple-600",
		bgColor: "bg-purple-50",
	},
	{
		type: PageSectionType.CHAT,
		label: "Chat Section",
		description: "Interactive AI chat interface",
		icon: MessageSquare,
		color: "text-green-600",
		bgColor: "bg-green-50",
	},
	{
		type: PageSectionType.HERO,
		label: "Hero Section",
		description: "Large banner with title, text, and optional image",
		icon: Zap,
		color: "text-orange-600",
		bgColor: "bg-orange-50",
	},
	{
		type: PageSectionType.CTA,
		label: "Call to Action",
		description: "Highlighted section with button to drive user action",
		icon: MousePointerClick,
		color: "text-pink-600",
		bgColor: "bg-pink-50",
	},
	{
		type: PageSectionType.FAQ,
		label: "FAQ Section",
		description: "Frequently asked questions in accordion format",
		icon: HelpCircle,
		color: "text-cyan-600",
		bgColor: "bg-cyan-50",
	},
	{
		type: PageSectionType.TESTIMONIALS,
		label: "Testimonials",
		description: "Customer reviews and testimonials",
		icon: Quote,
		color: "text-amber-600",
		bgColor: "bg-amber-50",
	},
	{
		type: PageSectionType.FEATURES,
		label: "Features",
		description: "Showcase features or benefits",
		icon: Sparkles,
		color: "text-indigo-600",
		bgColor: "bg-indigo-50",
	},
];

export function getSectionTypeConfig(type: PageSectionType): SectionTypeConfig {
	return SECTION_TYPES.find((s) => s.type === type) || SECTION_TYPES[0];
}
