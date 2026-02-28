import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
    imageUrl: string;
    storagePath: string; // Pour retrouver le fichier et le supprimer de Storage
    senderName?: string;
    message?: string;
    isVisible: boolean;
    createdAt: Date;
    expiresAt: Date; // TTL Index (7 jours)
}

const PhotoSchema: Schema = new Schema({
    imageUrl: { type: String, required: true },
    storagePath: { type: String, required: true },
    senderName: { type: String, default: 'Un invité' },
    message: { type: String, default: '' },
    isVisible: { type: Boolean, default: true }, // Publique par défaut (selon la remarque)
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    }
});

// Créer un index TTL : Le document sera automatiquement supprimé par MongoDB après l'expiration
PhotoSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Photo || mongoose.model<IPhoto>('Photo', PhotoSchema);
