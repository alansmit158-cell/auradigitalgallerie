"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function CoupleSection() {
    return (
        <section className="py-20 px-4 bg-white overflow-hidden">
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
                        alt="Mustafa & Ahlem"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-dark/10"></div>
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
                        <span className="text-primary font-bold uppercase tracking-widest text-sm">Les futurs mariés</span>
                        <h2 className="text-5xl md:text-6xl font-bold text-dark leading-tight">Mustafa & Ahlem</h2>
                    </div>

                    <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-lg">
                        "Dans l'éclat de notre amour, chaque instant partagé devient un trésor précieux.
                        Nous sommes heureux de célébrer ce nouveau chapitre de notre vie entourés de nos familles et amis."
                    </p>

                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-1 bg-primary rounded-full"></div>
                        <p className="text-dark font-bold tracking-widest uppercase text-sm">Vendredi, 01 Mai 2026</p>
                    </div>

                    <div className="pt-4">
                        <motion.a
                            href="#galerie"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block px-10 py-4 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/30 hover:bg-primary-dark transition-colors"
                        >
                            Voir la galerie
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
