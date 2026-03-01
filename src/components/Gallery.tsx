"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ShieldCheck } from "lucide-react";

interface PhotoData {
    _id: string;
    imageUrl: string;
    senderName?: string;
    message?: string;
    createdAt: string;
    isVisible: boolean; // Ajout du champ visibilité
}

interface GalleryProps {
    isAdmin?: boolean;
}

export default function Gallery({ isAdmin = false }: GalleryProps) {
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(true);

    const downloadImage = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
            window.open(url, '_blank');
        }
    };

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                // On passe le paramètre admin à l'API si nécessaire
                const url = isAdmin ? "/api/photos?admin=true" : "/api/photos";
                const res = await fetch(url);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPhotos(data);
                }
            } catch (error) {
                console.error("Error fetching photos", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
        const interval = setInterval(fetchPhotos, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-stone-200 border-dashed">
                <p className="text-stone-500 text-lg font-medium">
                    {isAdmin ? "Aucune photo dans la base de données." : "Soyez le premier à partager une photo !"}
                </p>
                <p className="text-stone-400 mt-2 text-sm">Votre souvenir apparaîtra ici.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isAdmin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full w-fit mx-auto mb-8 border border-amber-200 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Mode Mariés (Tout est visible)</span>
                </div>
            )}

            <div className="w-full columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                <AnimatePresence>
                    {photos.map((photo) => (
                        <motion.div
                            key={photo._id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            className={`break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white ${!photo.isVisible ? "ring-2 ring-amber-500 ring-offset-2" : ""}`}
                        >
                            <img
                                src={photo.imageUrl}
                                alt="Photo de mariage"
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />

                            {!photo.isVisible && (
                                <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-[8px] font-bold uppercase rounded shadow-lg z-10">
                                    Privé
                                </div>
                            )}

                            {/* Overlay avec infos et bouton Télécharger */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                                <div className="flex justify-between items-end gap-2">
                                    <div className="flex-1 min-w-0">
                                        {photo.message && (
                                            <p className="text-white text-[10px] md:text-xs italic mb-1 line-clamp-2">"{photo.message}"</p>
                                        )}
                                        {photo.senderName && (
                                            <p className="text-amber-300 text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">De {photo.senderName}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => downloadImage(photo.imageUrl, `mariage-${photo._id}.jpg`)}
                                        className="p-2 bg-amber-600 md:bg-white/20 backdrop-blur-md rounded-full text-white md:hover:bg-white md:hover:text-amber-600 transition-all shadow-lg active:scale-95"
                                        title="Télécharger"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
