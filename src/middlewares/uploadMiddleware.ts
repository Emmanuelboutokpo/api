import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

const uploadFolderPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath, { recursive: true });
}

// ✅ CORRECTION : Ajout des nouveaux champs modelImages et tissuImages
const allowedFileTypes: Record<string, RegExp> = {
  // Anciens champs (gardés pour compatibilité)
  imageUrl: /\.(jpg|jpeg|png)$/i,
  imgCmd: /\.(jpg|jpeg|png)$/i,
  audioFile: /\.(mp3|mp4|ogg|3gpp|wav|m4a)$/i,
  
  // ✅ NOUVEAUX CHAMPS pour les images multiples
  modelImages: /\.(jpg|jpeg|png)$/i,
  tissuImages: /\.(jpg|jpeg|png)$/i,
};

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    const allowedPattern = allowedFileTypes[file.fieldname];
    if (!allowedPattern) {
      // ✅ Message d'erreur plus informatif avec les champs autorisés
      const allowedFields = Object.keys(allowedFileTypes).join(', ');
      return cb(new Error(
        `Le champ "${file.fieldname}" n'est pas autorisé. ` +
        `Champs autorisés: ${allowedFields}`
      ));
    }

    // Vérifie si le fichier correspond au pattern
    if (!allowedPattern.test(file.originalname)) {
      const expectedTypes = file.fieldname.includes('image') ? 'JPG, JPEG, PNG' : 'MP3, MP4, OGG, 3GPP, WAV, M4A';
      return cb(new Error(
        `Type de fichier invalide pour "${file.fieldname}". ` +
        `Types attendus: ${expectedTypes}`
      ));
    }

    cb(null, true);
  } catch (error) {
    console.error('Erreur lors du filtrage des fichiers:', error);
    cb(error as Error);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolderPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
    const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${safeOriginalName}`);
  },
});

// ✅ CORRECTION : Augmenter la limite de fichiers pour supporter les images multiples
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Mo max par fichier
    files: 21, // ✅ Augmenté à 21 (10 modelImages + 10 tissuImages + 1 audioFile)
  },
});

export default upload;