import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Photo from '@/models/Photo';

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const isAdmin = searchParams.get('admin') === 'true';

        // Si admin, toutes les photos, sinon uniquement celles visibles
        const query = isAdmin ? {} : { isVisible: true };
        const photos = await Photo.find(query).sort({ createdAt: -1 });

        return NextResponse.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { photos, senderName, message, theme, isPrivate } = body;

        const hasPhotos = photos && Array.isArray(photos) && photos.length > 0;
        const hasMessage = message && message.trim().length > 0;

        if (!hasPhotos && !hasMessage) {
            return NextResponse.json({ error: 'Une photo ou un message est requis' }, { status: 400 });
        }

        const isVisible = !isPrivate;
        const savedPhotos = [];

        if (hasPhotos) {
            for (const p of photos) {
                const newPhoto = new Photo({
                    imageUrl: p.imageUrl,
                    publicId: p.publicId,
                    senderName: senderName || 'Un invité',
                    message: message || '',
                    isVisible
                });
                const saved = await newPhoto.save();
                savedPhotos.push(saved);
            }
        } else {
            // Text only post
            const newPhoto = new Photo({
                senderName: senderName || 'Un invité',
                message: message || '',
                theme: theme || 'dark',
                isVisible
            });
            const saved = await newPhoto.save();
            savedPhotos.push(saved);
        }

        return NextResponse.json(savedPhotos, { status: 201 });
    } catch (error) {
        console.error('Error uploading photos:', error);
        return NextResponse.json({ error: 'Failed to upload photos' }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const isAdmin = searchParams.get('admin') === 'true';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await Photo.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const isAdmin = searchParams.get('admin') === 'true';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const body = await req.json();
        const { isVisible } = body;

        const updatedPhoto = await Photo.findByIdAndUpdate(
            id,
            { isVisible },
            { new: true }
        );

        return NextResponse.json(updatedPhoto);
    } catch (error) {
        console.error('Error updating photo:', error);
        return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
    }
}
