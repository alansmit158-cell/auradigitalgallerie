"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { UploadCloud, CheckCircle2, Loader2, ImagePlus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadPhoto() {
    const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
    const [senderName, setSenderName] = useState("");
    const [message, setMessage] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0); // overall progress
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

        try {
            const uploadedData: { imageUrl: string, storagePath: string }[] = [];
            let totalBytesTransferred = 0;
            let totalBytesTotal = 0;

            const compressionOptions = {
                maxSizeMB: 1, // Max 1MB
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            // Compresser toutes les images avant l'upload
            const compressedFiles = await Promise.all(
                files.map(f => imageCompression(f.file, compressionOptions))
            );

            // Calcul du poids total pour la barre de progression
            totalBytesTotal = compressedFiles.reduce((acc, file) => acc + file.size, 0);

            // Upload séquentiel ou parallèle sur Firebase
            const uploadPromises = compressedFiles.map((compressedFile) => {
                return new Promise<{ imageUrl: string, storagePath: string }>((resolve, reject) => {
                    const timestamp = Date.now();
                    const storagePath = `wedding-photos/${timestamp}_${compressedFile.name}`;
                    const storageRef = ref(storage, storagePath);
                    const uploadTask = uploadBytesResumable(storageRef, compressedFile);

                    let previousBytesTransferred = 0;

                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const currentDelta = snapshot.bytesTransferred - previousBytesTransferred;
                            totalBytesTransferred += currentDelta;
                            previousBytesTransferred = snapshot.bytesTransferred;

                            const progressPercent = (totalBytesTransferred / totalBytesTotal) * 100;
                            setProgress(progressPercent);
                        },
                        (error) => reject(error),
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve({ imageUrl: downloadURL, storagePath });
                        }
                    );
                });
            });

            const results = await Promise.all(uploadPromises);
            uploadedData.push(...results);

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
                console.error(await response.text());
                setStatus("error");
            }
        } catch (error) {
            console.error("Compression/Upload error:", error);
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
                        {/* Zone d'Upload Principale */}
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
                                <p className="text-xs text-gray-400">JPG, PNG, WEBP (compressé auto)</p>
                            </div>
                        </div>

                        {/* Aperçu des miniatures */}
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
                            placeholder="Un petit mot pour un souvenir magique ? (optionnel)"
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
                                <span>Envoi en cours ({Math.round(progress)}%)</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <UploadCloud className="w-5 h-5" />
                                <span>Partager {files.length > 0 ? `${files.length} photo${files.length > 1 ? 's' : ''}` : "vos photos"}</span>
                            </div>
                        )}
                    </button>

                    <p className="text-xs text-center text-stone-400">Les photos publiques resteront visibles 7 jours dans la galerie.</p>

                    {status === "error" && (
                        <p className="text-red-500 text-sm text-center font-medium animate-pulse">Une erreur est survenue lors de l'envoi.</p>
                    )}
                </form>
            )}
        </div>
    );
}
