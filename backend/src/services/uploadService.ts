import { MultipartFile } from '@fastify/multipart';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  width?: number;
  height?: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

// Ensure upload directories exist
export async function ensureUploadDirs() {
  const dirs = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'uploads', 'projects'),
    path.join(process.cwd(), 'uploads', 'projects', 'originals'),
    path.join(process.cwd(), 'uploads', 'projects', 'optimized'),
    path.join(process.cwd(), 'uploads', 'projects', 'thumbnails'),
    path.join(process.cwd(), 'uploads', 'temp'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

// Validate file type
export function validateFileType(mimetype: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimetype);
}

// Process and save uploaded image
export async function processImage(
  file: MultipartFile,
  options: ImageProcessingOptions = {}
): Promise<UploadedFile> {
  const {
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 85,
    format = 'jpeg',
    generateThumbnail = true,
    thumbnailWidth = 400,
    thumbnailHeight = 400,
  } = options;

  // Ensure directories exist
  await ensureUploadDirs();

  // Generate filenames
  const filename = generateFilename(file.filename);
  const nameWithoutExt = filename.replace(path.extname(filename), '');
  const optimizedFilename = `${nameWithoutExt}.${format}`;
  const thumbnailFilename = `${nameWithoutExt}_thumb.${format}`;

  // Define paths
  const originalPath = path.join(process.cwd(), 'uploads', 'projects', 'originals', filename);
  const optimizedPath = path.join(process.cwd(), 'uploads', 'projects', 'optimized', optimizedFilename);
  const thumbnailPath = path.join(process.cwd(), 'uploads', 'projects', 'thumbnails', thumbnailFilename);

  // Save original file
  const buffer = await file.toBuffer();
  await fs.writeFile(originalPath, buffer);

  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const { width = 0, height = 0 } = metadata;

  // Process main image
  let sharpInstance = sharp(buffer);

  // Resize if needed
  if (width > maxWidth || height > maxHeight) {
    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert format and optimize
  if (format === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
  } else if (format === 'png') {
    sharpInstance = sharpInstance.png({ quality, progressive: true });
  } else if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ quality });
  }

  // Save optimized image
  await sharpInstance.toFile(optimizedPath);

  // Generate thumbnail if requested
  if (generateThumbnail) {
    await sharp(buffer)
      .resize(thumbnailWidth, thumbnailHeight, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbnailPath);
  }

  // Get optimized file size
  const stats = await fs.stat(optimizedPath);

  return {
    filename: optimizedFilename,
    originalName: file.filename,
    mimetype: `image/${format}`,
    size: stats.size,
    path: optimizedPath,
    url: `/uploads/projects/optimized/${optimizedFilename}`,
    width: Math.min(width, maxWidth),
    height: Math.min(height, maxHeight),
  };
}

// Process PDF or other document
export async function processDocument(file: MultipartFile): Promise<UploadedFile> {
  await ensureUploadDirs();

  const filename = generateFilename(file.filename);
  const filePath = path.join(process.cwd(), 'uploads', 'projects', 'originals', filename);

  // Save file
  const buffer = await file.toBuffer();
  await fs.writeFile(filePath, buffer);

  // Get file stats
  const stats = await fs.stat(filePath);

  return {
    filename,
    originalName: file.filename,
    mimetype: file.mimetype,
    size: stats.size,
    path: filePath,
    url: `/uploads/projects/originals/${filename}`,
  };
}

// Delete uploaded files
export async function deleteUploadedFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }
}

// Get file info
export async function getFileInfo(filePath: string): Promise<{
  exists: boolean;
  size?: number;
  mimetype?: string;
}> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const mimetypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.dwg': 'application/dwg',
    };

    return {
      exists: true,
      size: stats.size,
      mimetype: mimetypes[ext] || 'application/octet-stream',
    };
  } catch {
    return { exists: false };
  }
}