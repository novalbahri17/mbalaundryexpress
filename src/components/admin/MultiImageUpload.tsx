import { DeleteOutlined, InboxOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, message, Progress, Space } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

export interface UploadingFile {
	id: string;
	file: File;
	preview: string;
	progress: number;
	status: "uploading" | "done" | "error";
	error?: string;
}

interface MultiImageUploadProps {
	uploadingFiles: UploadingFile[];
	setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFile[]>>;
	maxFiles?: number;
	maxFileSize?: number; // in MB
	accept?: string[];
}

export function MultiImageUpload({
	uploadingFiles,
	setUploadingFiles,
	maxFiles = 20,
	maxFileSize = 10, // 10MB default
	accept = ["image/png", "image/jpeg", "image/webp", "image/gif"],
}: MultiImageUploadProps) {
	const [isProcessing, setIsProcessing] = useState(false);

	const compressImage = useCallback(async (file: File): Promise<File> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const url = URL.createObjectURL(file);

			img.onload = () => {
				URL.revokeObjectURL(url);

				// Calculate new dimensions (max 1920px)
				const maxDimension = 1920;
				let { width, height } = img;

				if (width > maxDimension || height > maxDimension) {
					if (width > height) {
						height = Math.round((height * maxDimension) / width);
						width = maxDimension;
					} else {
						width = Math.round((width * maxDimension) / height);
						height = maxDimension;
					}
				}

				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");

				if (!ctx) {
					reject(new Error("Failed to get canvas context"));
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);

				// Convert to WebP with quality 0.85
				canvas.toBlob(
					(blob) => {
						if (blob) {
							const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp" });
							resolve(compressedFile);
						} else {
							reject(new Error("Failed to compress image"));
						}
					},
					"image/webp",
					0.85,
				);
			};

			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error("Failed to load image"));
			};

			img.src = url;
		});
	}, []);

	const onDrop = useCallback(
		async (files: File[]) => {
			if (uploadingFiles.length + files.length > maxFiles) {
				message.error(`Maksimal ${maxFiles} gambar`);
				return;
			}

			setIsProcessing(true);
			const newFiles: UploadingFile[] = [];

			for (const file of files) {
				// Check file size
				if (file.size > maxFileSize * 1024 * 1024) {
					message.error(`${file.name} melebihi ${maxFileSize}MB`);
					continue;
				}

				try {
					// Compress image
					const compressedFile = await compressImage(file);

					newFiles.push({
						id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
						file: compressedFile,
						preview: URL.createObjectURL(compressedFile),
						progress: 0,
						status: "uploading",
					});
				} catch (_error) {
					message.error(`Gagal memproses ${file.name}`);
				}
			}

			setUploadingFiles((prev) => [...prev, ...newFiles]);
			setIsProcessing(false);
		},
		[uploadingFiles.length, maxFiles, maxFileSize, setUploadingFiles, compressImage],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: accept.reduce<Record<string, string[]>>((acc, current) => {
			acc[current] = [];
			return acc;
		}, {}),
		maxFiles: maxFiles - uploadingFiles.length,
		disabled: isProcessing || uploadingFiles.length >= maxFiles,
		onDropRejected: (rejectedFiles) => {
			const errors = rejectedFiles.map((r) => r.errors[0]?.message).filter(Boolean);
			if (errors.length > 0) {
				message.error(errors[0]);
			}
		},
	});

	const removeFile = useCallback(
		(id: string) => {
			setUploadingFiles((prev) => {
				const file = prev.find((f) => f.id === id);
				if (file?.preview) {
					URL.revokeObjectURL(file.preview);
				}
				return prev.filter((f) => f.id !== id);
			});
		},
		[setUploadingFiles],
	);

	const updateProgress = useCallback(
		(id: string, progress: number, status: UploadingFile["status"] = "uploading") => {
			setUploadingFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress, status } : f)));
		},
		[setUploadingFiles],
	);

	// Expose updateProgress untuk digunakan di parent
	useMemo(() => {
		(window as unknown as { updateUploadProgress?: typeof updateProgress }).updateUploadProgress = updateProgress;
	}, [updateProgress]);

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
					isDragActive
						? "border-red-500 bg-red-50 dark:bg-red-500/10"
						: uploadingFiles.length >= maxFiles
							? "border-slate-200 bg-slate-50 cursor-not-allowed"
							: "border-slate-300 hover:border-red-400 dark:border-slate-700"
				}`}
			>
				<input {...getInputProps()} multiple />
				{isProcessing ? (
					<Space direction="vertical" className="w-full">
						<LoadingOutlined className="text-2xl text-red-600" />
						<p className="text-sm text-slate-600">Mengompres gambar...</p>
					</Space>
				) : uploadingFiles.length >= maxFiles ? (
					<>
						<InboxOutlined className="text-2xl text-slate-400" />
						<p className="mt-2 text-sm text-slate-500">Maksimal {maxFiles} gambar tercapai</p>
					</>
				) : (
					<>
						<InboxOutlined className="text-2xl text-red-600" />
						<p className="mt-2 text-sm font-medium">Drag & drop gambar di sini, atau klik untuk pilih</p>
						<p className="text-xs text-slate-500 mt-1">
							Maks {maxFiles} gambar, {maxFileSize}MB per file. Auto-compress ke WebP
						</p>
					</>
				)}
			</div>

			{uploadingFiles.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{uploadingFiles.map((file) => (
						<div
							key={file.id}
							className="relative group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
						>
							<div className="aspect-square">
								<img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
							</div>

							{/* Progress overlay */}
							{file.status === "uploading" && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<Progress type="circle" percent={file.progress} size={50} strokeColor="#ef4444" />
								</div>
							)}

							{/* Error overlay */}
							{file.status === "error" && (
								<div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
									<p className="text-white text-xs text-center px-2">{file.error || "Error"}</p>
								</div>
							)}

							{/* Remove button */}
							<Button
								type="primary"
								danger
								size="small"
								icon={<DeleteOutlined />}
								className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={() => removeFile(file.id)}
							/>

							{/* File info */}
							<div className="p-2 bg-white dark:bg-slate-800">
								<p className="text-xs truncate" title={file.file.name}>
									{file.file.name}
								</p>
								<p className="text-xs text-slate-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
