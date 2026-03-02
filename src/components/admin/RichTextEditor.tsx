import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button, Space } from "antd";

type RichTextEditorProps = {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [StarterKit, Link, Image],
		content: value ?? "",
		onUpdate: ({ editor: currentEditor }) => {
			onChange?.(currentEditor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "min-h-[180px] rounded-b-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none dark:border-slate-700 dark:bg-slate-900",
				placeholder: placeholder ?? "Tulis konten...",
			},
		},
	});

	return (
		<div>
			<Space wrap className="mb-2">
				<Button size="small" onClick={() => editor?.chain().focus().toggleBold().run()} type={editor?.isActive("bold") ? "primary" : "default"}>Bold</Button>
				<Button size="small" onClick={() => editor?.chain().focus().toggleItalic().run()} type={editor?.isActive("italic") ? "primary" : "default"}>Italic</Button>
				<Button size="small" onClick={() => editor?.chain().focus().toggleBulletList().run()} type={editor?.isActive("bulletList") ? "primary" : "default"}>Bullet</Button>
				<Button size="small" onClick={() => editor?.chain().focus().toggleOrderedList().run()} type={editor?.isActive("orderedList") ? "primary" : "default"}>Numbered</Button>
			</Space>
			<div className="rounded-xl">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}

