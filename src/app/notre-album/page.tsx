import Gallery from "@/components/Gallery";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function PrivateAlbumPage() {
    return (
        <main className="min-h-screen bg-stone-50 font-sans selection:bg-amber-200 py-12 px-4">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Privé */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>

                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3 text-amber-600 mb-2">
                            <Heart className="w-6 h-6 fill-current" />
                            <span className="uppercase tracking-[0.3em] text-sm font-bold">Espace Privé</span>
                            <Heart className="w-6 h-6 fill-current" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                            Notre Album Secret
                        </h1>
                        <p className="text-stone-500 font-light max-w-xl mx-auto italic">
                            Raouia & Islem, voici toutes les photos partagées par vos invités, y compris les souvenirs gardés privés.
                        </p>
                    </div>
                    <div className="w-24 h-1 bg-amber-200 rounded-full"></div>
                </div>

                {/* Galerie en mode Admin */}
                <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-stone-100">
                    <Gallery isAdmin={true} />
                </div>

                {/* Footer Admin */}
                <footer className="text-center pt-8 border-t border-stone-200">
                    <p className="text-stone-400 text-xs italic">
                        Cet espace est réservé aux mariés. Les photos marquées d'un badge "Privé" ne sont pas visibles sur l'accueil public.
                    </p>
                </footer>
            </div>
        </main>
    );
}
