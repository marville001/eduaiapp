"use client";

import { TiptapEditor } from "@/components/tiptap/editor/tiptap-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/lib/api/page.api";

interface CtaSectionEditorProps {
	section: PageSection;
	onUpdate: (section: PageSection) => void;
}

export default function CtaSectionEditor({
	section,
	onUpdate,
}: CtaSectionEditorProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`title-${section.id}`}>CTA Title</Label>
					<Input
						id={`title-${section.id}`}
						value={section.title || ""}
						onChange={(e) => onUpdate({ ...section, title: e.target.value })}
						placeholder="e.g., Ready to Get Started?"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`summary-${section.id}`}>CTA Subtitle</Label>
					<Input
						id={`summary-${section.id}`}
						value={section.summary || ""}
						onChange={(e) => onUpdate({ ...section, summary: e.target.value })}
						placeholder="e.g., Join thousands of happy users"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label>CTA Description</Label>
				<TiptapEditor
					value={section.content || ""}
					onChange={({ html }) => onUpdate({ ...section, content: html })}
					showToolbar={true}
					containerClasses="min-h-[120px]"
				/>
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
						placeholder="e.g., Start Free Trial"
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
							placeholder="e.g., #6366f1"
						/>
						<input
							type="color"
							value={section.backgroundColor || "#6366f1"}
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

			{/* Preview */}
			<div
				className="rounded-lg p-8 text-center"
				style={{
					backgroundColor: section.backgroundColor || "#6366f1",
					color: section.textColor || "#ffffff",
				}}
			>
				<h3 className="text-xl font-bold">
					{section.title || "Your CTA Title"}
				</h3>
				<p className="mt-2 opacity-90">
					{section.summary || "Your CTA subtitle will appear here"}
				</p>
				{section.buttonText && (
					<button className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors">
						{section.buttonText}
					</button>
				)}
				<p className="text-xs mt-4 opacity-60">Preview Only</p>
			</div>
		</div>
	);
}
