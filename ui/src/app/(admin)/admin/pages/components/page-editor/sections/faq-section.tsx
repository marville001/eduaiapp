"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GridItem, PageSection } from "@/lib/api/page.api";
import { cn } from "@/lib/utils";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

// Generate unique ID
const generateId = () => `faq-item-${Math.random().toString(36).substring(2, 11)}`;

interface FaqSectionEditorProps {
	section: PageSection;
	onUpdate: (section: PageSection) => void;
}

function SortableFaqItem({
	item,
	onUpdate,
	onDelete,
}: {
	item: GridItem;
	onUpdate: (item: GridItem) => void;
	onDelete: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn("transition-all", isDragging && "opacity-50 z-50")}
		>
			<Card className="border border-gray-200">
				<CardContent className="p-3">
					<div className="flex items-start gap-2">
						<button
							className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded mt-1"
							{...attributes}
							{...listeners}
						>
							<GripVertical className="h-4 w-4 text-gray-400" />
						</button>

						<div className="flex-1 space-y-3">
							<div className="flex items-center justify-between">
								<Input
									value={item.title}
									onChange={(e) => onUpdate({ ...item, title: e.target.value })}
									placeholder="FAQ Question"
									className="flex-1 font-medium"
								/>
								<div className="flex items-center gap-1 ml-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setIsExpanded(!isExpanded)}
										className="h-8 w-8 p-0 text-gray-500"
									>
										{isExpanded ? (
											<ChevronUp className="h-4 w-4" />
										) : (
											<ChevronDown className="h-4 w-4" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={onDelete}
										className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{isExpanded && (
								<div className="space-y-2">
									<Label className="text-xs text-gray-500">Answer</Label>
									<Textarea
										value={item.description}
										onChange={(e) =>
											onUpdate({ ...item, description: e.target.value })
										}
										placeholder="Enter the answer to this FAQ..."
										rows={3}
									/>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function FaqSectionEditor({
	section,
	onUpdate,
}: FaqSectionEditorProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const faqItems = section.gridItems || [];

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = faqItems.findIndex((item) => item.id === active.id);
			const newIndex = faqItems.findIndex((item) => item.id === over.id);
			const newItems = arrayMove(faqItems, oldIndex, newIndex);
			onUpdate({ ...section, gridItems: newItems });
		}
	};

	const addItem = () => {
		const newItem: GridItem = {
			id: generateId(),
			title: "",
			description: "",
		};
		onUpdate({ ...section, gridItems: [...faqItems, newItem] });
	};

	const updateItem = (index: number, item: GridItem) => {
		const newItems = [...faqItems];
		newItems[index] = item;
		onUpdate({ ...section, gridItems: newItems });
	};

	const deleteItem = (index: number) => {
		const newItems = faqItems.filter((_, i) => i !== index);
		onUpdate({ ...section, gridItems: newItems });
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`title-${section.id}`}>Section Title</Label>
					<Input
						id={`title-${section.id}`}
						value={section.title || ""}
						onChange={(e) => onUpdate({ ...section, title: e.target.value })}
						placeholder="e.g., Frequently Asked Questions"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`summary-${section.id}`}>Section Summary</Label>
					<Input
						id={`summary-${section.id}`}
						value={section.summary || ""}
						onChange={(e) => onUpdate({ ...section, summary: e.target.value })}
						placeholder="e.g., Find answers to common questions"
					/>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>FAQ Items</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addItem}
						className="h-8"
					>
						<Plus className="h-4 w-4 mr-1" />
						Add Question
					</Button>
				</div>

				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={faqItems.map((item) => item.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-2">
							{faqItems.map((item, index) => (
								<SortableFaqItem
									key={item.id}
									item={item}
									onUpdate={(updatedItem) => updateItem(index, updatedItem)}
									onDelete={() => deleteItem(index)}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>

				{faqItems.length === 0 && (
					<div className="text-center py-8 border-2 border-dashed rounded-lg">
						<p className="text-gray-500">No FAQ items yet</p>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={addItem}
							className="mt-2"
						>
							<Plus className="h-4 w-4 mr-1" />
							Add your first question
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
