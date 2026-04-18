import UploadPhoto from "@/components/UploadPhoto";
import Gallery from "@/components/Gallery";
import CoupleSection from "@/components/CoupleSection";
import Link from "next/link";
import { Heart, Instagram, Facebook, Youtube, MessageCircle, Link as LinkIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-primary selection:text-white relative">
      {/* Lien Secret (Haut) */}
      <Link
        href="/notre-album"
        className="fixed top-4 right-4 z-[100] p-3 text-gray-300 hover:text-primary transition-all duration-500 opacity-50 hover:opacity-100"
        title="Accès Mariés"
      >
        <Heart className="w-5 h-5 fill-current" />
      </Link>
      {/* Hero Section */}
      <section className="relative py-20 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* ... (contenu existant) */}
        <div className="absolute inset-0 z-0 text-primary-light/10">
          {/* Bulles décoratives */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <p className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-primary">Célébrons ensemble</p>
          <h1 className="text-5xl md:text-7xl font-bold text-dark leading-tight">
            Mustafa & Ahlem
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            Immortalisez les plus beaux moments de notre mariage.
            Partagez vos photos avec nous et tous les invités.
          </p>
        </div>
      </section>

      {/* Section des Mariés */}
      <CoupleSection />

      {/* Upload Section */}
      <section className="py-12 px-4 relative z-20">
        <div className="max-w-5xl mx-auto">
          <UploadPhoto />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-4 md:px-8 bg-white" id="galerie">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-12 space-y-4">
            <h2 className="text-4xl font-bold text-dark">Galerie Souvenirs</h2>
            <div className="w-24 h-1 bg-primary rounded-full"></div>
            <p className="text-gray-500 font-medium max-w-xl">
              Retrouvez ici tous les instants magiques capturés par nos proches.
            </p>
          </div>
          <Gallery />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 text-center border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <img src="/00.png" alt="Aura Digital Logo" className="h-12 w-auto object-contain opacity-90 grayscale" />
          </div>

          {/* Réseaux Sociaux */}
          <div className="flex gap-6 items-center">
            <a
              href="https://www.instagram.com/aura_____digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary hover:scale-110 transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61588511615603"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary hover:scale-110 transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>

            <a
              href="https://www.youtube.com/@auradigital2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary hover:scale-110 transition-all"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>

            <a
              href="https://api.whatsapp.com/send?phone=21629574856"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary hover:scale-110 transition-all"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            <a
              href="https://linktr.ee/Aura_Digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary hover:scale-110 transition-all"
              aria-label="Linktree"
            >
              <LinkIcon className="w-5 h-5" />
            </a>
          </div>

          <div className="text-gray-400 text-xs font-sans mt-2 font-medium">
            © {new Date().getFullYear()} Aura Digital. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  );
}
