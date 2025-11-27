"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageSection, PageSectionType } from "@/lib/api/page.api";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ChevronDown,
	ChevronUp,
	Copy,
	GripVertical,
	Trash2,
} from "lucide-react";
import { getSectionTypeConfig } from "./section-types";
import ChatSectionEditor from "./sections/chat-section";
import CtaSectionEditor from "./sections/cta-section";
import FaqSectionEditor from "./sections/faq-section";
import FeaturesSectionEditor from "./sections/features-section";
import GridSectionEditor from "./sections/grid-section";
import HeroSectionEditor from "./sections/hero-section";
import RichTextSectionEditor from "./sections/rich-text-section";
import TestimonialsSectionEditor from "./sections/testimonials-section";

interface SortableSectionProps {
	section: PageSection;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
	onUpdate: (section: PageSection) => void;
	onDelete: () => void;
	onDuplicate: () => void;
}

export function SortableSection({
	section,
	isCollapsed,
	onToggleCollapse,
	onUpdate,
	onDelete,
	onDuplicate,
}: SortableSectionProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: section.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const config = getSectionTypeConfig(section.type);
	const Icon = config.icon;

	const renderSectionEditor = () => {
		switch (section.type) {
			case PageSectionType.RICH_TEXT:
				return <RichTextSectionEditor section={section} onUpdate={onUpdate} />;
			case PageSectionType.GRID:
				return <GridSectionEditor section={section} onUpdate={onUpdate} />;
			case PageSectionType.CHAT:
				return <ChatSectionEditor section={section} onUpdate={onUpdate} />;
			case PageSectionType.HERO:
				return <HeroSectionEditor section={section} onUpdate={onUpdate} />;
			case PageSectionType.CTA:
				return <CtaSectionEditor section={section} onUpdate={onUpdate} />;
			case PageSectionType.FAQ:
				return <FaqSectionEditor section={section} onUpdate={onUpdate} />;
			case PageSectionType.TESTIMONIALS:
				return (
					<TestimonialsSectionEditor section={section} onUpdate={onUpdate} />
				);
			case PageSectionType.FEATURES:
				return <FeaturesSectionEditor section={section} onUpdate={onUpdate} />;
			default:
				return <RichTextSectionEditor section={section} onUpdate={onUpdate} />;
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"transition-all duration-200",
				isDragging && "opacity-50 z-50"
			)}
		>
			<Card
				className={cn(
					"border-2 transition-all duration-200",
					isDragging
						? "border-primary shadow-lg ring-2 ring-primary/20"
						: "border-border hover:border-gray-300"
				)}
			>
				<CardHeader className="py-3 px-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{/* Drag Handle */}
							<button
								type='button'
								className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
								{...attributes}
								{...listeners}
							>
								<GripVertical className="h-5 w-5 text-gray-400" />
							</button>

							{/* Section Type Icon & Label */}
							<div
								className={cn(
									"flex items-center gap-2 px-3 py-1.5 rounded-full",
									config.bgColor
								)}
							>
								<Icon className={cn("h-4 w-4", config.color)} />
								<span className={cn("text-sm font-medium", config.color)}>
									{config.label}
								</span>
							</div>

							{/* Section Title Preview */}
							{section.title && (
								<span className="text-sm text-gray-600 truncate max-w-[200px]">
									{section.title}
								</span>
							)}
						</div>

						<div className="flex items-center gap-1">
							{/* Duplicate Button */}
							<Button
								variant="ghost"
								size="sm"
								type='button'
								onClick={onDuplicate}
								className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
							>
								<Copy className="h-4 w-4" />
							</Button>

							{/* Delete Button */}
							<Button
								variant="ghost"
								size="sm"
								type='button'
								onClick={onDelete}
								className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
							>
								<Trash2 className="h-4 w-4" />
							</Button>

							{/* Collapse Toggle */}
							<Button
								variant="ghost"
								size="sm"
								type='button'
								onClick={onToggleCollapse}
								className="h-8 w-8 p-0 text-gray-500"
							>
								{isCollapsed ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronUp className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</CardHeader>

				{!isCollapsed && (
					<CardContent className="pt-0 pb-4 px-4">
						<div className="pl-9">{renderSectionEditor()}</div>
					</CardContent>
				)}
			</Card>
		</div>
	);
}
