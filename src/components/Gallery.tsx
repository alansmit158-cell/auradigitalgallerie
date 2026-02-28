"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoData {
    _id: string;
    imageUrl: string;
    senderName?: string;
    message?: string;
    createdAt: string;
}

export default function Gallery() {
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await fetch("/api/photos");
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
        const interval = setInterval(fetchPhotos, 30000); // Auto-refresh 30s
        return () => clearInterval(interval);
    }, []);

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
                <p className="text-stone-500 text-lg font-medium">Soyez le premier à partager une photo !</p>
                <p className="text-stone-400 mt-2 text-sm">Votre souvenir apparaîtra ici.</p>
            </div>
        );
    }

    return (
        <div className="w-full columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence>
                {photos.map((photo) => (
                    <motion.div
                        key={photo._id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white"
                    >
                        <img
                            src={photo.imageUrl}
                            alt="Photo de mariage"
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                        />

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {photo.message && (
                                <p className="text-white text-sm italic mb-2 line-clamp-3">"{photo.message}"</p>
                            )}
                            {photo.senderName && (
                                <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">De {photo.senderName}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
