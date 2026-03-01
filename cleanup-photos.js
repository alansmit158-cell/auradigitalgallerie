const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');

// CORRECTIF DNS
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// 1. Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'drquwzmvb',
    api_key: '974542497853538',
    api_secret: 'lgK0RoB8khT5Ppj20NwKECcwQRs'
});

// 2. MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

const PhotoSchema = new mongoose.Schema({
    publicId: { type: String, required: true }
}, {
    collection: 'auradigitalgallerie_photos'
});

const Photo = mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);

async function cleanup() {
    console.log("🔌 Connexion à MongoDB...");
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connecté à MongoDB.");
    } catch (err) {
        console.error("❌ Erreur connexion MongoDB :", err.message);
        return;
    }

    try {
        const photos = await Photo.find({});
        console.log(`🔍 Trouvé ${photos.length} photos à supprimer.`);

        if (photos.length === 0) {
            console.log("✨ La galerie est déjà vide.");
            return;
        }

        // Suppression sur Cloudinary par lots de 100 (limite API)
        const publicIds = photos.map(p => p.publicId);

        console.log("🗑️ Suppression sur Cloudinary...");

        // On supprime par paquets pour éviter de saturer l'API
        for (let i = 0; i < publicIds.length; i += 100) {
            const chunk = publicIds.slice(i, i + 100);
            await new Promise((resolve, reject) => {
                cloudinary.api.delete_resources(chunk, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });
            console.log(`✅ [${Math.min(i + 100, publicIds.length)}/${publicIds.length}] Images Cloudinary supprimées.`);
        }

        // Suppression dans MongoDB
        console.log("🧹 Vidage de la base de données MongoDB...");
        await Photo.deleteMany({});
        console.log("✅ MongoDB vidé avec succès.");

    } catch (err) {
        console.error("❌ Erreur pendant le nettoyage :", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🏁 Nettoyage terminé.");
    }
}

cleanup();
