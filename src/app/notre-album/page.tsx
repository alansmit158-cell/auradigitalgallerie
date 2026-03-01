"use client";

import { useState } from "react";
import Gallery from "@/components/Gallery";
import Link from "next/link";
import { Heart, ArrowLeft, Lock, ArrowRight, Activity, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PrivateAlbumPage() {
    const [password, setPassword] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [error, setError] = useState(false);

    // États pour le test de connexion
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null);

    const CORRECT_PASSWORD = "raouiaislem03.05.2026";

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            setIsAuthorized(true);
            setError(false);
        } else {
            setError(true);
            setPassword("");
        }
    };

    const runVercelTest = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await fetch('/api/admin/test-db?admin=true', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setTestResult({ success: true, message: "Connexion Vercel ➔ MongoDB ➔ Cloudinary : RÉUSSIE ! Une photo de test a été ajoutée." });
            } else {
                setTestResult({ success: false, message: "Erreur : " + (data.error || "Échec du test") });
            }
        } catch (err) {
            setTestResult({ success: false, message: "Erreur réseau lors du test." });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <main className="min-h-screen bg-stone-50 font-sans selection:bg-amber-200 py-12 px-4">
            <AnimatePresence mode="wait">
                {!isAuthorized ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-md mx-auto mt-20"
                    >
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 flex flex-col items-center space-y-8">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                <Lock className="w-8 h-8" />
                            </div>

                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-serif text-stone-900">Espace Mariés</h1>
                                <p className="text-sm text-stone-500 font-light">Veuillez entrer le mot de passe secret pour accéder à votre album.</p>
                            </div>

                            <form onSubmit={handleLogin} className="w-full space-y-4">
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="Mot de passe"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(false);
                                        }}
                                        className={`w-full px-5 py-4 rounded-xl border ${error ? "border-red-300 bg-red-50" : "border-gray-100 bg-gray-50 uppercase tracking-widest"} focus:bg-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:capitalize placeholder:tracking-normal`}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 bottom-2 px-4 bg-stone-900 text-amber-50 rounded-lg hover:bg-stone-800 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-red-500 text-xs text-center font-medium"
                                    >
                                        Mot de passe incorrect. Réessayez.
                                    </motion.p>
                                )}
                            </form>

                            <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Retour au site public
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-7xl mx-auto space-y-12"
                    >
                        {/* Header Privé */}
                        <div className="flex flex-col items-center text-center space-y-6">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Retour à l'accueil
                            </Link>

                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-3 text-amber-600 mb-2">
                                    <Heart className="w-6 h-6 fill-current" />
                                    <span className="uppercase tracking-[0.3em] text-sm font-bold">Espace Privé</span>
                                    <Heart className="w-6 h-6 fill-current" />
                                </div>
                                <h1 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                                    Notre Album Secret
                                </h1>
                                <p className="text-stone-500 font-light max-w-xl mx-auto italic text-sm md:text-base">
                                    Raouia & Islem, voici toutes les photos partagées par vos invités, y compris les souvenirs gardés privés.
                                </p>

                                {/* Outil de Diagnostic Vercel */}
                                <div className="pt-4">
                                    {!testResult ? (
                                        <button
                                            onClick={runVercelTest}
                                            disabled={isTesting}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-semibold transition-all border border-stone-200 disabled:opacity-50"
                                        >
                                            {isTesting ? <Loader2 className="w-3 h-3 animate-spin text-amber-600" /> : <Activity className="w-3 h-3 text-amber-600" />}
                                            {isTesting ? "Test de connexion en cours..." : "Lancer un test de connexion (Vercel)"}
                                        </button>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border ${testResult.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                                        >
                                            {testResult.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {testResult.message}
                                            <button onClick={() => setTestResult(null)} className="ml-2 underline opacity-50 hover:opacity-100">X</button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            <div className="w-24 h-1 bg-amber-200 rounded-full"></div>
                        </div>

                        {/* Galerie en mode Admin */}
                        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-stone-100">
                            <Gallery isAdmin={true} />
                        </div>

                        {/* Footer Admin */}
                        <footer className="text-center pt-8 border-t border-stone-200">
                            <p className="text-stone-400 text-[10px] md:text-xs italic">
                                Cet espace est réservé aux mariés. Les photos marquées d'un badge "Privé" ne sont pas visibles sur l'accueil public.
                            </p>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
