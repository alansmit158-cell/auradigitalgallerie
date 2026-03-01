"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
    const [env, setEnv] = useState<any>(null);

    useEffect(() => {
        setEnv({
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "MANQUANT",
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "MANQUANT",
            nodeEnv: process.env.NODE_ENV
        });
    }, []);

    if (!env) return <div className="p-10">Chargement...</div>;

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Diagnostic Environnement</h1>
            <div className="space-y-2">
                <p>Cloud Name : <span className={env.cloudName === "MANQUANT" ? "text-red-500" : "text-green-600"}>{env.cloudName}</span></p>
                <p>Upload Preset : <span className={env.uploadPreset === "MANQUANT" ? "text-red-500" : "text-green-600"}>{env.uploadPreset}</span></p>
                <p>Mode : {env.nodeEnv}</p>
            </div>
            <div className="mt-10 p-4 bg-gray-100 rounded">
                <p className="font-bold">Instructions :</p>
                <ul className="list-disc ml-5 mt-2">
                    <li>Si c'est "MANQUANT", les variables ne sont pas lues.</li>
                    <li>Vérifiez que vous avez cliqué sur "Save" dans Vercel Settings.</li>
                    <li>Assurez-vous d'avoir fait un "Redeploy" APRES avoir sauvé les variables.</li>
                </ul>
            </div>
        </div>
    );
}
