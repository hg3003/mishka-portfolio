import path from 'path';
import fs from 'fs';

const isElectron = process.env.ELECTRON_RUN === 'true' || !!(process as any).versions?.electron;

export function getUploadPath() {
  if (isElectron && process.env.USER_DATA_PATH) {
    const uploadsPath = path.join(process.env.USER_DATA_PATH, 'uploads');
    if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
    return uploadsPath;
  }
  const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
  return uploadsPath;
}