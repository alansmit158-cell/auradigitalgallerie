const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// --- CONFIGURATION ---

// 1. Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'drquwzmvb',
    api_key: '974542497853538',
    api_secret: 'lgK0RoB8khT5Ppj20NwKECcwQRs'
});

// 2. MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Définition du modèle Photo (version simplifiée pour le script)
const PhotoSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    senderName: { type: String, default: 'Robot de Test' },
    message: { type: String, default: 'Ceci est un test de charge automatique' },
    isVisible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire dans 7 jours
    }
}, {
    collection: 'auradigitalgallerie_photos'
});

const Photo = mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);

// --- FONCTION DE TEST ---

async function stressTest() {
    const totalPhotos = 1; // Uniquement une photo par défaut
    const imagePath = path.join(__dirname, 'public', 'wedding_couple_illustration.png');

    if (!fs.existsSync(imagePath)) {
        console.error("❌ Image de source introuvable : ", imagePath);
        return;
    }

    console.log("🔌 Connexion à MongoDB...");
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connecté à MongoDB.");
    } catch (err) {
        console.error("❌ Erreur connexion MongoDB :", err.message);
        return;
    }

    const dummyBuffer = fs.readFileSync(imagePath);
    const photoSizeMB = (dummyBuffer.length / (1024 * 1024)).toFixed(2);

    console.log(`🚀 Début du test complet : ${totalPhotos} photos.`);

    for (let i = 0; i < totalPhotos; i++) {
        try {
            // 1. Upload vers Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "stress_test_wedding",
                        tags: ["test_charge_visible"]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(dummyBuffer);
            });

            console.log(`📸 [${i + 1}/${totalPhotos}] Cloudinary OK : ${result.public_id}`);

            // 2. Enregistrement dans MongoDB
            const newPhoto = new Photo({
                imageUrl: result.secure_url,
                publicId: result.public_id,
                senderName: 'Robot de Test',
                message: `Test de charge #${i + 1} - Image réelle`,
                isVisible: true
            });

            await newPhoto.save();
            console.log(`💾 [${i + 1}/${totalPhotos}] MongoDB OK.`);

        } catch (err) {
            console.error(`❌ Erreur sur l'étape ${i + 1} :`, err.message);
            if (err.message.includes("limit")) break;
        }
    }

    console.log("🏁 Test terminé. Les photos devraient être visibles sur le site !");
    await mongoose.disconnect();
}

stressTest();
