"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/lib/api/page.api";

interface ChatSectionEditorProps {
	section: PageSection;
	onUpdate: (section: PageSection) => void;
}

export default function ChatSectionEditor({
	section,
	onUpdate,
}: ChatSectionEditorProps) {
	return (
		<div className="space-y-4">
			{/* <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
				<MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
				<div>
					<p className="text-sm font-medium text-green-800">Chat Section</p>
					<p className="text-sm text-green-700 mt-1">
						This section will render an interactive AI chat interface. The title
						and summary below will be displayed above the chat form.
					</p>
				</div>
			</div> */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`title-${section.id}`}>Section Title</Label>
					<Input
						id={`title-${section.id}`}
						value={section.title || ""}
						onChange={(e) => onUpdate({ ...section, title: e.target.value })}
						placeholder="e.g., Ask Our AI Assistant"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`summary-${section.id}`}>Section Summary</Label>
					<Input
						id={`summary-${section.id}`}
						value={section.summary || ""}
						onChange={(e) => onUpdate({ ...section, summary: e.target.value })}
						placeholder="e.g., Get instant answers to your questions"
					/>
				</div>
			</div>

		</div>
	);
}
