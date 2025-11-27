"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PageSection, PageSectionType } from "@/lib/api/page.api";
import { cn } from "@/lib/utils";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronUp, Layers, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { getSectionTypeConfig, SECTION_TYPES } from "./section-types";
import { SortableSection } from "./sortable-section";

// Generate unique ID
const generateId = () => `section-${Math.random().toString(36).substring(2, 11)}`;

interface PageSectionsEditorProps {
	sections: PageSection[];
	onChange: (sections: PageSection[]) => void;
}

export function PageSectionsEditor({
	sections,
	onChange,
}: PageSectionsEditorProps) {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
		new Set()
	);
	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (over && active.id !== over.id) {
			const oldIndex = sections.findIndex((s) => s.id === active.id);
			const newIndex = sections.findIndex((s) => s.id === over.id);
			const newSections = arrayMove(sections, oldIndex, newIndex).map(
				(s, index) => ({ ...s, order: index })
			);
			onChange(newSections);
		}
	};

	const addSection = (type: PageSectionType) => {
		const newSection: PageSection = {
			id: generateId(),
			type,
			order: sections.length,
			title: "",
			summary: "",
			content: "",
			gridItems: [],
			gridColumns: 3,
		};
		onChange([...sections, newSection]);
		setIsAddDialogOpen(false);
	};

	const updateSection = useCallback(
		(updatedSection: PageSection) => {
			const newSections = sections.map((s) =>
				s.id === updatedSection.id ? updatedSection : s
			);
			onChange(newSections);
		},
		[sections, onChange]
	);

	const deleteSection = (id: string) => {
		const newSections = sections
			.filter((s) => s.id !== id)
			.map((s, index) => ({ ...s, order: index }));
		onChange(newSections);
	};

	const duplicateSection = (section: PageSection) => {
		const duplicatedSection: PageSection = {
			...section,
			id: generateId(),
			order: sections.length,
			title: section.title ? `${section.title} (Copy)` : "",
		};
		onChange([...sections, duplicatedSection]);
	};

	const toggleCollapse = (id: string) => {
		const newCollapsed = new Set(collapsedSections);
		if (newCollapsed.has(id)) {
			newCollapsed.delete(id);
		} else {
			newCollapsed.add(id);
		}
		setCollapsedSections(newCollapsed);
	};

	const collapseAll = () => {
		setCollapsedSections(new Set(sections.map((s) => s.id)));
	};

	const expandAll = () => {
		setCollapsedSections(new Set());
	};

	const activeSection = activeId
		? sections.find((s) => s.id === activeId)
		: null;

	return (
		<Card className="border-0 shadow-none">
			<CardHeader className="px-3 pt-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Layers className="h-5 w-5 text-gray-500" />
						<CardTitle className="text-lg">Page Sections</CardTitle>
						<span className="text-sm text-gray-500">
							({sections.length} sections)
						</span>
					</div>
					<div className="flex items-center gap-2">
						{sections.length > 0 && (
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									type='button'
									onClick={collapseAll}
									className="h-8 text-xs"
								>
									<ChevronUp className="h-3 w-3 mr-1" />
									Collapse All
								</Button>
								<Button
									variant="ghost"
									size="sm"
									type='button'
									onClick={expandAll}
									className="h-8 text-xs"
								>
									<ChevronDown className="h-3 w-3 mr-1" />
									Expand All
								</Button>
							</div>
						)}
						<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
							<DialogTrigger asChild>
								<Button type='button' size="sm" className="h-8">
									<Plus className="h-4 w-4 mr-1" />
									Add Section
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl">
								<DialogHeader>
									<DialogTitle>Add a New Section</DialogTitle>
									<DialogDescription>
										Choose the type of section you want to add to your page.
									</DialogDescription>
								</DialogHeader>
								<div className="grid grid-cols-2 gap-3 mt-4">
									{SECTION_TYPES.map((sectionType) => {
										const Icon = sectionType.icon;
										return (
											<button
												key={sectionType.type}
												onClick={() => addSection(sectionType.type)}
												className={cn(
													"flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all",
													"hover:border-primary hover:shadow-md",
													"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
												)}
												type='button'
											>
												<div
													className={cn(
														"p-2 rounded-lg",
														sectionType.bgColor
													)}
												>
													<Icon className={cn("h-5 w-5", sectionType.color)} />
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-gray-900">
														{sectionType.label}
													</h4>
													<p className="text-sm text-gray-500 mt-0.5">
														{sectionType.description}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-3 pb-0">
				{sections.length === 0 ? (
					<div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50">
						<Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No sections yet
						</h3>
						<p className="text-gray-500 mb-4 max-w-sm mx-auto">
							Start building your page by adding sections. You can drag and drop
							to reorder them.
						</p>
						<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
							<DialogTrigger asChild>
								<Button type='button'>
									<Plus className="h-4 w-4 mr-2" />
									Add Your First Section
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl">
								<DialogHeader>
									<DialogTitle>Add a New Section</DialogTitle>
									<DialogDescription>
										Choose the type of section you want to add to your page.
									</DialogDescription>
								</DialogHeader>
								<div className="grid grid-cols-2 gap-3 mt-4">
									{SECTION_TYPES.map((sectionType) => {
										const Icon = sectionType.icon;
										return (
											<button
												type='button'
												key={sectionType.type}
												onClick={() => addSection(sectionType.type)}
												className={cn(
													"flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all",
													"hover:border-primary hover:shadow-md",
													"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
												)}
											>
												<div
													className={cn(
														"p-2 rounded-lg",
														sectionType.bgColor
													)}
												>
													<Icon className={cn("h-5 w-5", sectionType.color)} />
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-gray-900">
														{sectionType.label}
													</h4>
													<p className="text-sm text-gray-500 mt-0.5">
														{sectionType.description}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</DialogContent>
						</Dialog>
					</div>
				) : (
					<>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={sections.map((s) => s.id)}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-3">
									{sections.map((section) => (
										<SortableSection
											key={section.id}
											section={section}
											isCollapsed={collapsedSections.has(section.id)}
											onToggleCollapse={() => toggleCollapse(section.id)}
											onUpdate={updateSection}
											onDelete={() => deleteSection(section.id)}
											onDuplicate={() => duplicateSection(section)}
										/>
									))}
								</div>
							</SortableContext>
							<DragOverlay>
								{activeSection && (
									<Card className="border-2 border-primary shadow-lg opacity-90">
										<CardHeader className="py-3 px-4">
											<div className="flex items-center gap-3">
												{(() => {
													const config = getSectionTypeConfig(activeSection.type);
													const Icon = config.icon;
													return (
														<div
															className={cn(
																"flex items-center gap-2 px-3 py-1.5 rounded-full",
																config.bgColor
															)}
														>
															<Icon className={cn("h-4 w-4", config.color)} />
															<span
																className={cn("text-sm font-medium", config.color)}
															>
																{config.label}
															</span>
														</div>
													);
												})()}
												{activeSection.title && (
													<span className="text-sm text-gray-600 truncate">
														{activeSection.title}
													</span>
												)}
											</div>
										</CardHeader>
									</Card>
								)}
							</DragOverlay>
						</DndContext>

						<div className="mt-4 flex justify-center py-16">
							<Button onClick={() => setIsAddDialogOpen(true)} type='button' size="sm" className="h-8">
								<Plus className="h-4 w-4 mr-1" />
								Add Section
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

export default PageSectionsEditor;
