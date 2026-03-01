"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { UploadCloud, CheckCircle2, Loader2, ImagePlus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadPhoto() {
    const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
    const [senderName, setSenderName] = useState("");
    const [message, setMessage] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const newFiles = selectedFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setFiles(prev => [...prev, ...newFiles]);
            setStatus("idle");
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setIsUploading(true);
        setStatus("idle");
        setProgress(0);

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            console.error("Cloudinary configuration missing:", { cloudName: !!cloudName, uploadPreset: !!uploadPreset });
            setStatus("error");
            setIsUploading(false);
            return;
        }

        try {
            const uploadedData: { imageUrl: string, publicId: string }[] = [];

            // Compression
            const compressionOptions = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressedFiles = await Promise.all(
                files.map(f => imageCompression(f.file, compressionOptions))
            );

            // Upload simple vers Cloudinary (Unsigned)
            for (let i = 0; i < compressedFiles.length; i++) {
                const file = compressedFiles[i];
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", uploadPreset);
                formData.append("folder", "wedding_gallery");

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!res.ok) throw new Error("Cloudinary upload failed");

                const data = await res.json();
                uploadedData.push({
                    imageUrl: data.secure_url,
                    publicId: data.public_id
                });

                // Update progress
                setProgress(((i + 1) / compressedFiles.length) * 100);
            }

            // Save to MongoDB
            const response = await fetch("/api/photos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    photos: uploadedData,
                    senderName,
                    message,
                    isPrivate
                }),
            });

            if (response.ok) {
                setStatus("success");
                setFiles([]);
                setSenderName("");
                setMessage("");
                setIsPrivate(false);
                setProgress(0);
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setStatus("error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-100/50">
            <h2 className="text-3xl font-serif text-amber-900 text-center mb-6 tracking-tight">Partager un souvenir</h2>

            {status === "success" ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-10 space-y-4"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-xl font-medium text-gray-800">Merci pour vos photos !</p>
                    <p className="text-sm text-gray-500 px-4">Elles seront visibles dans la galerie pendant 7 jours.</p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="mt-6 px-8 py-3 bg-amber-600/10 text-amber-800 font-medium rounded-full hover:bg-amber-600/20 transition-colors"
                    >
                        Ajouter d'autres photos
                    </button>
                </motion.div>
            ) : (
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="space-y-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-amber-200"
                        >
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                    <ImagePlus className="w-8 h-8 text-amber-500" />
                                </div>
                                <p className="mb-1 text-sm text-gray-600 font-medium px-4 text-center">Appuyez pour sélectionner plusieurs photos</p>
                                <p className="text-xs text-gray-400">JPG, PNG, WEBP (Cloudinary Gratuit)</p>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto py-2 -mx-2 px-2 snap-x scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
                                {files.map((f, index) => (
                                    <div key={index} className="relative w-20 h-20 flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-sm group">
                                        <img src={f.preview} alt="Aperçu" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Votre nom/pseudo (optionnel)"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-gray-400"
                        />

                        <textarea
                            placeholder="Un petit mot ? (optionnel)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all resize-none placeholder:text-gray-400"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center space-x-4 cursor-pointer group bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 hover:bg-amber-50 transition-colors">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 transition cursor-pointer"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-800 font-medium">Garder privé</span>
                                <span className="text-xs text-gray-500">Visible uniquement par les mariés</span>
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={files.length === 0 || isUploading}
                        className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-medium text-white transition-all duration-300 ${files.length === 0 || isUploading ? "bg-amber-200 cursor-not-allowed text-amber-50" : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5"}`}
                    >
                        {isUploading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Envoi Cloudinary ({Math.round(progress)}%)</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <UploadCloud className="w-5 h-5" />
                                <span>Partager {files.length > 0 ? `${files.length} photo${files.length > 1 ? 's' : ''}` : "vos photos"}</span>
                            </div>
                        )}
                    </button>

                    <p className="text-xs text-center text-stone-400 italic">Photos visibles 7 jours.</p>

                    {status === "error" && (
                        <div className="text-red-500 text-sm text-center font-medium space-y-1">
                            <p>Oups ! L'envoi a échoué.</p>
                            {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
                                <p className="text-[10px] opacity-70">Erreur : Variable Cloud Name manquante sur Vercel.</p>
                            )}
                            {!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET && (
                                <p className="text-[10px] opacity-70">Erreur : Variable Upload Preset manquante sur Vercel.</p>
                            )}
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}
