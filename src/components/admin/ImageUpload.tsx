import { InboxOutlined } from "@ant-design/icons";
import { message } from "antd";
import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";

type ImageUploadProps = {
	value?: File | null;
	onChange?: (file: File | null) => void;
	previewUrl?: string;
	accept?: string[];
};

export function ImageUpload({ value, onChange, previewUrl, accept = ["image/png", "image/jpeg", "image/webp"] }: ImageUploadProps) {
	const onDrop = useCallback(
		(files: File[]) => {
			const file = files[0];
			if (!file) return;
			onChange?.(file);
		},
		[onChange],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: accept.reduce<Record<string, string[]>>((acc, current) => ({ ...acc, [current]: [] }), {}),
		maxFiles: 1,
		onDropRejected: () => {
			message.error("File tidak didukung");
		},
	});

	const imageSrc = useMemo(() => {
		if (value) return URL.createObjectURL(value);
		return previewUrl;
	}, [value, previewUrl]);

	return (
		<div className="space-y-3">
			<div
				{...getRootProps()}
				className={`cursor-pointer rounded-xl border border-dashed p-6 text-center transition ${isDragActive ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-slate-300 dark:border-slate-700"}`}
			>
				<input {...getInputProps()} />
				<InboxOutlined className="text-xl text-red-600" />
				<p className="mt-2 text-sm">Drag & drop gambar, atau klik untuk pilih file</p>
			</div>
			{imageSrc ? (
				<div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
					<img src={imageSrc} alt="Preview upload" className="h-44 w-full object-cover" />
				</div>
			) : null}
		</div>
	);
}

