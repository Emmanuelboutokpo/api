import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

const uploadFolderPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath, { recursive: true });
}

const allowedFileTypes: Record<string, RegExp> = {
  imageUrl: /\.(jpg|jpeg|png)$/i,
  imgCmd: /\.(jpg|jpeg|png)$/i,
  audioFile: /\.(mp3|mp4|ogg|3gpp|wav|m4a)$/i,
};


const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    const allowedPattern = allowedFileTypes[file.fieldname];
    if (!allowedPattern) {
      // Champ de fichier non autorisé
      return cb(new Error(`Le champ "${file.fieldname}" n’est pas autorisé pour l’upload.`));
    }

    // Vérifie si le fichier correspond au pattern
    if (!allowedPattern.test(file.originalname)) {
      return cb(new Error(`Type de fichier invalide pour "${file.fieldname}".`));
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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Mo max
    files: 3, 
  },
});

export default upload;
