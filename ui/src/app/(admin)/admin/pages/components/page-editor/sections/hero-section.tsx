"use client";

import { ImageUpload } from "@/components/forms/image-upload";
import { TiptapEditor } from "@/components/tiptap/editor/tiptap-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/lib/api/page.api";

interface HeroSectionEditorProps {
	section: PageSection;
	onUpdate: (section: PageSection) => void;
}

export default function HeroSectionEditor({
	section,
	onUpdate,
}: HeroSectionEditorProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`title-${section.id}`}>Hero Title</Label>
					<Input
						id={`title-${section.id}`}
						value={section.title || ""}
						onChange={(e) => onUpdate({ ...section, title: e.target.value })}
						placeholder="Enter hero title..."
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`summary-${section.id}`}>Hero Subtitle</Label>
					<Input
						id={`summary-${section.id}`}
						value={section.summary || ""}
						onChange={(e) => onUpdate({ ...section, summary: e.target.value })}
						placeholder="Enter subtitle..."
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`buttonText-${section.id}`}>Button Text</Label>
					<Input
						id={`buttonText-${section.id}`}
						value={section.buttonText || ""}
						onChange={(e) =>
							onUpdate({ ...section, buttonText: e.target.value })
						}
						placeholder="e.g., Get Started"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`buttonLink-${section.id}`}>Button Link</Label>
					<Input
						id={`buttonLink-${section.id}`}
						value={section.buttonLink || ""}
						onChange={(e) =>
							onUpdate({ ...section, buttonLink: e.target.value })
						}
						placeholder="e.g., /signup"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<ImageUpload
					value={section.imageUrl}
					onChange={(value) => onUpdate({ ...section, imageUrl: value })}
					label="Hero Background/Image"
					description="Large background image for the hero section"
					placeholder="https://example.com/hero-image.jpg"
				/>
			</div>

			<div className="space-y-2">
				<Label>Hero Content</Label>
				<TiptapEditor
					value={section.content || ""}
					onChange={({ html }) => onUpdate({ ...section, content: html })}
					showToolbar={true}
					containerClasses="min-h-[150px]"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`bgColor-${section.id}`}>Background Color</Label>
					<div className="flex gap-2">
						<Input
							id={`bgColor-${section.id}`}
							value={section.backgroundColor || ""}
							onChange={(e) =>
								onUpdate({ ...section, backgroundColor: e.target.value })
							}
							placeholder="e.g., #1a1a2e"
						/>
						<input
							type="color"
							value={section.backgroundColor || "#1a1a2e"}
							onChange={(e) =>
								onUpdate({ ...section, backgroundColor: e.target.value })
							}
							className="h-10 w-10 rounded border cursor-pointer"
						/>
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`textColor-${section.id}`}>Text Color</Label>
					<div className="flex gap-2">
						<Input
							id={`textColor-${section.id}`}
							value={section.textColor || ""}
							onChange={(e) =>
								onUpdate({ ...section, textColor: e.target.value })
							}
							placeholder="e.g., #ffffff"
						/>
						<input
							type="color"
							value={section.textColor || "#ffffff"}
							onChange={(e) =>
								onUpdate({ ...section, textColor: e.target.value })
							}
							className="h-10 w-10 rounded border cursor-pointer"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
