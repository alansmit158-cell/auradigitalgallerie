"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { UploadCloud, CheckCircle2, Loader2, ImagePlus, X, ChevronLeft, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const THEMES: Record<string, { className: string, textClassName: string, btnClassName: string }> = {
    dark: {
        className: "bg-[#1A1820] shadow-2xl relative overflow-hidden",
        textClassName: "text-white placeholder-white/60",
        btnClassName: "bg-[#1A1820]"
    },
    smiley: {
        className: "bg-[#FDEBB6] shadow-inner",
        textClassName: "text-[#D2891B] placeholder-[#D2891B]/60",
        btnClassName: "bg-[#FDEBB6]"
    },
    light: {
        className: "bg-[#F3F4F6] shadow-inner",
        textClassName: "text-[#1E1B26] placeholder-[#1E1B26]/40",
        btnClassName: "bg-[#F3F4F6]"
    },
    pink: {
        className: "bg-[#FBD6E6] shadow-inner",
        textClassName: "text-primary placeholder-primary/50",
        btnClassName: "bg-[#FBD6E6]"
    },
    gradient: {
        className: "bg-gradient-to-br from-slate-700 via-slate-800 to-zinc-900 shadow-2xl",
        textClassName: "text-white placeholder-white/60",
        btnClassName: "bg-gradient-to-br from-slate-700 via-slate-800 to-zinc-900"
    }
};

export default function UploadPhoto() {
    const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
    const [senderName, setSenderName] = useState("");
    const [message, setMessage] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modale Texte
    const [showTextModal, setShowTextModal] = useState(false);
    const [theme, setTheme] = useState("dark");

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

    const submitPost = async (uploadedData: { imageUrl: string, publicId: string }[] = [], isTextOnly = false) => {
        try {
            const response = await fetch("/api/photos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    photos: uploadedData,
                    senderName,
                    message,
                    theme: isTextOnly ? theme : undefined,
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
                setShowTextModal(false);
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setStatus("error");
        } finally {
            setIsUploading(false);
        }
    }

    const handlePhotoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setIsUploading(true);
        setStatus("idle");
        setProgress(0);

        try {
            const uploadedData: { imageUrl: string, publicId: string }[] = [];

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                console.error("Cloudinary configuration missing");
                setStatus("error");
                setIsUploading(false);
                return;
            }

            // Compression
            const compressionOptions = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressedFiles = await Promise.all(
                files.map(f => imageCompression(f.file, compressionOptions))
            );

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

                if (!res.ok) {
                    const errorDetail = await res.json();
                    throw new Error(errorDetail.error?.message || "Cloudinary upload failed");
                }

                const data = await res.json();
                uploadedData.push({
                    imageUrl: data.secure_url,
                    publicId: data.public_id
                });

                setProgress(((i + 1) / compressedFiles.length) * 100);
            }

            await submitPost(uploadedData, false);
            
        } catch (error) {
            console.error("Upload error:", error);
            setStatus("error");
            setIsUploading(false);
        }
    };

    const handleTextSubmit = async () => {
        if (!message.trim()) return;
        setIsUploading(true);
        setStatus("idle");
        await submitPost([], true);
    }

    // Vue de succès
    if (status === "success") {
        return (
            <div className="w-full max-w-md mx-auto p-6 bg-white/90 backdrop-blur-xl rounded-[30px] shadow-2xl border border-gray-100 mt-4 md:mt-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-10 space-y-4"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-dark">Merci !</p>
                    <p className="text-sm text-gray-500 px-4">Votre post est maintenant visible dans la galerie.</p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="mt-6 px-8 py-3 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-colors"
                    >
                        Ajouter un autre post
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <>
            <div className="w-full max-w-lg mx-auto bg-transparent rounded-[30px] pt-8 pb-4">
                {files.length === 0 ? (
                    // ETAT VIDE : Dropzone KULULU + "Or add a text post"
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative flex flex-col items-center justify-center w-full min-h-[300px] border-[2px] border-dashed rounded-[40px] cursor-pointer transition-all duration-300 overflow-hidden border-primary bg-white hover:bg-primary/5 hover:border-primary shadow-[0_0_40px_rgba(253,8,144,0.1)]"
                        >
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                    <span className="text-primary text-4xl font-light leading-none mb-1">+</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold tracking-tight text-[#1E1B26] mb-1">Pick Photos & Videos</h3>
                                    <p className="text-base text-gray-400">Tap to select files</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-8">
                            <span className="text-[22px] text-dark font-medium">Or add a </span>
                            <button
                                type="button"
                                onClick={() => setShowTextModal(true)}
                                className="text-[22px] font-bold text-primary border-b-[3px] border-dashed border-primary hover:opacity-80 pb-0.5"
                            >
                                text post
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    // ETAT FICHIER SELECTED : Formulaire d'upload photo
                    <form onSubmit={handlePhotoUpload} className="space-y-6 bg-white p-6 rounded-[30px] border border-gray-100 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-dark text-lg">Vos photos</h3>
                            <button type="button" onClick={() => setFiles([])} className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">Annuler</button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto py-2 -mx-2 px-2 snap-x scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
                            {files.map((f, index) => (
                                <div key={index} className="relative w-24 h-24 flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-sm group border border-gray-100">
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
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 flex-shrink-0 snap-center rounded-xl bg-gray-50 border border-gray-200 border-dashed flex items-center justify-center text-gray-400 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                                <span className="text-3xl">+</span>
                            </button>
                            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        </div>

                        <div className="space-y-4 pt-4">
                            <textarea
                                placeholder="Un petit mot ? (optionnel)"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={2}
                                className="w-full px-5 py-4 rounded-[16px] border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none placeholder:text-gray-400 font-medium"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Prénom"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    className="w-full px-5 py-3 rounded-[16px] border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none font-medium text-sm"
                                />
                                <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-3 rounded-[16px] border border-gray-100 flex-shrink-0">
                                    <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
                                    <span className="text-xs font-bold text-dark">Privé</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`w-full py-4 rounded-full font-bold text-white transition-all text-lg ${isUploading ? "bg-gray-300" : "bg-primary hover:bg-primary-dark shadow-xl"}`}
                        >
                            {isUploading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Upload ({Math.round(progress)}%)</span>
                                </div>
                            ) : `Partager ${files.length} photo${files.length > 1 ? 's' : ''}`}
                        </button>
                    </form>
                )}
            </div>

            {/* TEXT POST MODAL (Façon bottom sheet / fullscreen mobile) */}
            <AnimatePresence>
                {showTextModal && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[200] flex flex-col bg-stone-50"
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md">
                            <button type="button" onClick={() => setShowTextModal(false)} className="flex items-center font-bold text-dark hover:opacity-70 text-lg">
                                <ChevronLeft className="w-6 h-6 mr-1" /> Back to album
                            </button>
                            <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Heart className="w-3 h-3 text-primary fill-primary" /> Made with <span className="font-bold text-primary">Aura</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col w-full bg-white">
                            {/* Preview Area */}
                            <div className={`relative w-full max-w-md mx-auto aspect-square rounded-[30px] flex items-center justify-center p-8 mb-8 transition-colors duration-500 ${THEMES[theme].className}`}>
                                {/* Petit effet décoratif sur le thème Dark */}
                                {theme === 'dark' && (
                                    <>
                                        <div className="absolute top-[-20px] left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                        <div className="absolute bottom-10 right-[-10px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                        <div className="absolute bottom-8 left-8 w-1 h-32 bg-white/20 rotate-45 transform origin-bottom-left"></div>
                                        <div className="absolute top-8 right-8 w-1 h-24 bg-white/10 -rotate-45 transform origin-top-right"></div>
                                    </>
                                )}

                                <textarea
                                    placeholder="What's on your mind?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className={`relative z-10 w-full h-full bg-transparent resize-none outline-none text-center font-bold text-3xl md:text-5xl flex items-center justify-center py-[25%] transition-colors duration-500 ${THEMES[theme].textClassName}`}
                                    style={{ lineHeight: '1.2' }}
                                />
                            </div>

                            <div className="max-w-md mx-auto w-full">
                                {/* Theme Selector */}
                                <div className="mb-8">
                                    <h4 className="font-bold text-dark mb-4 text-xl">Theme</h4>
                                    <div className="flex items-center gap-4 overflow-x-auto pb-4 snap-x px-1">
                                        {Object.keys(THEMES).map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setTheme(t)}
                                                className={`shrink-0 w-[70px] h-[70px] rounded-[20px] snap-center relative transition-all duration-300 ${THEMES[t].btnClassName} ${theme === t ? 'ring-2 ring-primary ring-offset-4 scale-105' : 'hover:scale-95 border border-gray-100'}`}
                                            >
                                                {theme === t && (
                                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                                                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-current stroke-[3]"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                )}
                                                {/* Mini décorations thématiques intérieures */}
                                                {t === 'smiley' && <span className="absolute inset-0 flex justify-center items-center text-3xl">😊</span>}
                                                {t === 'pink' && <Heart className="absolute inset-0 m-auto w-6 h-6 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-[24px]">
                                    <input
                                        type="text"
                                        placeholder="Votre prénom (optionnel)"
                                        value={senderName}
                                        onChange={(e) => setSenderName(e.target.value)}
                                        className="w-full px-5 py-4 rounded-[16px] border border-gray-100 bg-white focus:ring-2 focus:ring-primary/20 outline-none block font-medium"
                                    />
                                    <label className="flex items-center space-x-3 cursor-pointer px-2">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors border ${isPrivate ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                                            {isPrivate && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isPrivate}
                                            onChange={(e) => setIsPrivate(e.target.checked)}
                                            className="hidden"
                                        />
                                        <span className="text-sm font-bold text-gray-700">Garder privé (Réservé aux mariés)</span>
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleTextSubmit}
                                    disabled={!message.trim() || isUploading}
                                    className={`w-full py-5 rounded-[20px] font-extrabold text-white text-xl transition-all shadow-xl shadow-primary/20 ${!message.trim() || isUploading ? "bg-primary/50 text-white/80 cursor-not-allowed" : "bg-primary hover:bg-primary-dark hover:-translate-y-1"}`}
                                >
                                    {isUploading ? <Loader2 className="w-6 h-6 mx-auto animate-spin" /> : "Add Text Post"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
