"use client";

import { ImageUpload } from "@/components/forms/image-upload";
import { TiptapEditor } from "@/components/tiptap/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

// Generate unique ID
const generateId = () => `grid-item-${Math.random().toString(36).substring(2, 11)}`;

interface GridSectionEditorProps {
	section: PageSection;
	onUpdate: (section: PageSection) => void;
}

function SortableGridItem({
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
									placeholder="Item title"
									className="flex-1 font-medium"
								/>
								<div className="flex items-center gap-1 ml-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setIsExpanded(!isExpanded)}
										className="h-8 px-2 text-gray-500"
										type='button'
									>
										{isExpanded ? "Collapse" : "Expand"}
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
								<>
									<div className="space-y-2">
										<Label className="text-xs text-gray-500">Icon/Image URL</Label>
										<ImageUpload
											value={item.icon}
											onChange={(value) => onUpdate({ ...item, icon: value })}
											label=""
											description=""
											placeholder="https://example.com/icon.svg"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-gray-500">Description</Label>
										<TiptapEditor
											value={item.description}
											onChange={({ html }) =>
												onUpdate({ ...item, description: html })
											}
											showToolbar={true}
											containerClasses="min-h-[120px]"
										/>
									</div>
								</>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function GridSectionEditor({
	section,
	onUpdate,
}: GridSectionEditorProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const gridItems = section.gridItems || [];

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = gridItems.findIndex((item) => item.id === active.id);
			const newIndex = gridItems.findIndex((item) => item.id === over.id);
			const newItems = arrayMove(gridItems, oldIndex, newIndex);
			onUpdate({ ...section, gridItems: newItems });
		}
	};

	const addItem = () => {
		const newItem: GridItem = {
			id: generateId(),
			title: "",
			description: "",
			icon: "",
		};
		onUpdate({ ...section, gridItems: [...gridItems, newItem] });
	};

	const updateItem = (index: number, item: GridItem) => {
		const newItems = [...gridItems];
		newItems[index] = item;
		onUpdate({ ...section, gridItems: newItems });
	};

	const deleteItem = (index: number) => {
		const newItems = gridItems.filter((_, i) => i !== index);
		onUpdate({ ...section, gridItems: newItems });
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`title-${section.id}`}>Section Title</Label>
					<Input
						id={`title-${section.id}`}
						value={section.title || ""}
						onChange={(e) => onUpdate({ ...section, title: e.target.value })}
						placeholder="Enter section title..."
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`summary-${section.id}`}>Section Summary</Label>
					<Input
						id={`summary-${section.id}`}
						value={section.summary || ""}
						onChange={(e) => onUpdate({ ...section, summary: e.target.value })}
						placeholder="Brief description..."
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`columns-${section.id}`}>Grid Columns</Label>
					<Select
						value={String(section.gridColumns || 3)}
						onValueChange={(value) =>
							onUpdate({ ...section, gridColumns: parseInt(value) })
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select columns" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="2">2 Columns</SelectItem>
							<SelectItem value="3">3 Columns</SelectItem>
							<SelectItem value="4">4 Columns</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>Grid Items</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addItem}
						className="h-8"
					>
						<Plus className="h-4 w-4 mr-1" />
						Add Item
					</Button>
				</div>

				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={gridItems.map((item) => item.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-2">
							{gridItems.map((item, index) => (
								<SortableGridItem
									key={item.id}
									item={item}
									onUpdate={(updatedItem) => updateItem(index, updatedItem)}
									onDelete={() => deleteItem(index)}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>

				{gridItems.length === 0 && (
					<div className="text-center py-8 border-2 border-dashed rounded-lg">
						<p className="text-gray-500">No grid items yet</p>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={addItem}
							className="mt-2"
						>
							<Plus className="h-4 w-4 mr-1" />
							Add your first item
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
