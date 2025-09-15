// backend/uploads.config.js
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Raíz de uploads
const uploadsRoot = path.join(__dirname, 'uploads'); // asegúrate de no declararla dos veces
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Si viene :id en la ruta, guarda en /uploads/alumnos/:id
    const alumnoId = req.params?.id;
    const dest = alumnoId
      ? path.join(uploadsRoot, 'alumnos', String(alumnoId))
      : uploadsRoot;

    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({ storage });
export default upload;