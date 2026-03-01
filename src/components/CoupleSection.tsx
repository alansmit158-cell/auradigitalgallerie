"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function CoupleSection() {
    return (
        <section className="py-20 px-4 bg-stone-50 overflow-hidden">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Image Section */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white"
                >
                    <Image
                        src="/wedding_couple_illustration.png"
                        alt="Raouia & Islem"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent"></div>
                </motion.div>

                {/* Text Section */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-8 flex flex-col justify-center"
                >
                    <div className="space-y-2">
                        <span className="text-amber-600 font-serif italic text-2xl">Les futurs mariés</span>
                        <h2 className="text-6xl font-serif text-stone-900 leading-tight">Raouia & Islem</h2>
                    </div>

                    <p className="text-xl text-stone-600 font-light leading-relaxed">
                        "Dans l'éclat de notre amour, chaque instant partagé devient un trésor précieux.
                        Nous sommes heureux de célébrer ce nouveau chapitre de notre vie entourés de nos familles et amis."
                    </p>

                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-[1px] bg-amber-300"></div>
                        <p className="text-amber-800 font-medium tracking-widest uppercase text-sm">Dimanche, 01 Mars 2026</p>
                    </div>

                    <div className="pt-4">
                        <motion.a
                            href="#galerie"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block px-10 py-4 bg-stone-900 text-amber-50 rounded-full font-medium shadow-xl hover:bg-stone-800 transition-colors"
                        >
                            Voir la galerie
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
