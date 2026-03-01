import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Photo from '@/models/Photo';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const isAdmin = searchParams.get('admin') === 'true';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Test de connexion MongoDB
        await connectToDatabase();

        // 2. Préparation d'une image de test (plus simple : utiliser une URL connue ou le fichier local si possible)
        // On va utiliser l'image d'illustration du projet
        const imagePath = path.join(process.cwd(), 'public', 'wedding_couple_illustration.png');

        if (!fs.existsSync(imagePath)) {
            return NextResponse.json({ error: 'Image source introuvable sur le serveur' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(imagePath);

        // 3. Upload vers Cloudinary depuis le serveur Vercel
        const cloudinaryResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "test_vercel_diagnostic",
                    tags: ["diagnostic_auto"]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });

        // 4. Enregistrement dans MongoDB
        const newPhoto = new Photo({
            imageUrl: cloudinaryResult.secure_url,
            publicId: cloudinaryResult.public_id,
            senderName: 'Diagnostic Vercel',
            message: 'Test de connexion réussi directement depuis le serveur !',
            isVisible: true
        });

        await newPhoto.save();

        return NextResponse.json({
            success: true,
            message: 'Test réussi ! L\'image a été uploadée et enregistrée.',
            photo: newPhoto
        });

    } catch (error: any) {
        console.error('Erreur diagnostic:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Erreur inconnue'
        }, { status: 500 });
    }
}
