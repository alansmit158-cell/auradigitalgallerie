const cloudinary = require('cloudinary').v2;

// Configuration avec vos clés
cloudinary.config({
    cloud_name: 'drquwzmvb',
    api_key: '974542497853538',
    api_secret: 'lgK0RoB8khT5Ppj20NwKECcwQRs'
});

/**
 * ATTENTION : 
 * 10 000 photos x 2.5 Mo = 25 Go.
 * Votre compte Cloudinary Gratuit est limité à 25 Go.
 * L'exécution complète de ce script va remplir presque tout votre compte Cloudinary.
 */

async function stressTest() {
    const totalPhotos = 10; // Par défaut à 10 pour sécurité. Mettez 10000 pour le test complet.
    const photoSizeMB = 2.5;

    console.log(`🚀 Début du test : ${totalPhotos} photos de ${photoSizeMB}Mo chacune.`);
    console.log(`📦 Estimation totale : ${(totalPhotos * photoSizeMB) / 1024} Go.`);
    console.log(`⚠️  Rappel : Limite Cloudinary Free = 25 Go.`);

    // Création d'un buffer de 2.5Mo pour simuler une photo
    const dummyBuffer = Buffer.alloc(Math.floor(photoSizeMB * 1024 * 1024), 'x');

    for (let i = 0; i < totalPhotos; i++) {
        try {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "stress_test_wedding",
                        tags: ["test_charge"]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(dummyBuffer);
            });

            console.log(`✅ [${i + 1}/${totalPhotos}] Uploadé : ${result.public_id}`);
        } catch (err) {
            console.error(`❌ Erreur sur l'upload ${i + 1} :`, err.message);
            // On s'arrête si le compte est saturé
            if (err.message.includes("limit")) {
                console.log("🛑 Limite atteinte ! Arrêt du script.");
                break;
            }
        }
    }

    console.log("🏁 Test terminé.");
}

stressTest();
