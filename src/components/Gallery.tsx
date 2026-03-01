"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ShieldCheck, Trash2, X, Maximize2, User, MessageSquare } from "lucide-react";

interface PhotoData {
    _id: string;
    imageUrl: string;
    senderName?: string;
    message?: string;
    createdAt: string;
    isVisible: boolean;
}

interface GalleryProps {
    isAdmin?: boolean;
}

export default function Gallery({ isAdmin = false }: GalleryProps) {
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);

    const fetchPhotos = async () => {
        try {
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

    useEffect(() => {
        fetchPhotos();
        const interval = setInterval(fetchPhotos, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

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

    const deletePhoto = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette photo ? Cette action est irréversible.")) return;

        try {
            const res = await fetch(`/api/photos?id=${id}&admin=true`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setPhotos(photos.filter(p => p._id !== id));
                setSelectedPhoto(null);
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

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
                            layoutId={photo._id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => setSelectedPhoto(photo)}
                            className={`break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white cursor-zoom-in ${!photo.isVisible ? "ring-2 ring-amber-500 ring-offset-2" : ""}`}
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

                            {/* Badge Détails Rapides */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {/* Overlay avec bouton Télécharger sur l'accueil */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-3 flex justify-between items-center">
                                <div className="truncate pr-2">
                                    <p className="text-white text-[10px] truncate font-medium">{photo.senderName}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadImage(photo.imageUrl, `mariage-${photo._id}.jpg`);
                                    }}
                                    className="p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-amber-600 transition-colors shadow-lg"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal de Détails */}
            <AnimatePresence>
                {selectedPhoto && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"
                        />

                        <motion.div
                            layoutId={selectedPhoto._id}
                            className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Bouton Fermer */}
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute top-4 right-4 z-20 p-2 bg-stone-900/10 hover:bg-stone-900/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-stone-700" />
                            </button>

                            {/* Image (Gauche) */}
                            <div className="md:w-3/5 bg-stone-100 relative group min-h-[300px]">
                                <img
                                    src={selectedPhoto.imageUrl}
                                    alt="Détails"
                                    className="w-full h-full object-contain"
                                />
                                {!selectedPhoto.isVisible && (
                                    <div className="absolute top-6 left-6 px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase rounded-full shadow-lg">
                                        Souvenir Privé
                                    </div>
                                )}
                            </div>

                            {/* Infos (Droite) */}
                            <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-between space-y-8 bg-white overflow-y-auto">
                                <div className="space-y-8 mt-4 md:mt-0">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-amber-600">
                                            <div className="p-2 bg-amber-50 rounded-xl">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Partagé par</span>
                                        </div>
                                        <p className="text-2xl font-serif text-stone-900">{selectedPhoto.senderName}</p>
                                    </div>

                                    {selectedPhoto.message && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-amber-600">
                                                <div className="p-2 bg-amber-50 rounded-xl">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Leur mot doux</span>
                                            </div>
                                            <p className="text-stone-600 font-light leading-relaxed italic border-l-2 border-stone-100 pl-4 py-1">
                                                "{selectedPhoto.message}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-[10px] text-stone-400 uppercase tracking-tighter">
                                        Capturé le {new Date(selectedPhoto.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => downloadImage(selectedPhoto.imageUrl, `mariage-${selectedPhoto._id}.jpg`)}
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-stone-900 border border-stone-800 text-white rounded-2xl hover:bg-stone-800 transition-all font-medium shadow-xl shadow-stone-900/20"
                                    >
                                        <Download className="w-5 h-5 text-amber-400" />
                                        Télécharger la photo
                                    </button>

                                    {isAdmin && (
                                        <button
                                            onClick={() => deletePhoto(selectedPhoto._id)}
                                            className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-red-100 text-red-500 rounded-2xl hover:bg-red-50 transition-all font-medium"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            Supprimer définitivement
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
