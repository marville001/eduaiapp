"use client";

import { TiptapEditor } from "@/components/tiptap/editor/tiptap-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/lib/api/page.api";

interface RichTextSectionEditorProps {
	section: PageSection;
	onUpdate: (section: PageSection) => void;
}

export default function RichTextSectionEditor({
	section,
	onUpdate,
}: RichTextSectionEditorProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`title-${section.id}`}>Section Title (Optional)</Label>
					<Input
						id={`title-${section.id}`}
						value={section.title || ""}
						onChange={(e) => onUpdate({ ...section, title: e.target.value })}
						placeholder="Enter section title..."
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`summary-${section.id}`}>Section Summary (Optional)</Label>
					<Input
						id={`summary-${section.id}`}
						value={section.summary || ""}
						onChange={(e) => onUpdate({ ...section, summary: e.target.value })}
						placeholder="Brief description..."
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Content</Label>
				<TiptapEditor
					value={section.content || ""}
					onChange={({ html }) => onUpdate({ ...section, content: html })}
					showToolbar={true}
					containerClasses="min-h-[250px]"
				/>
			</div>
		</div>
	);
}
