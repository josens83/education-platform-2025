/**
 * AWS S3 File Upload Utility
 *
 * 파일을 AWS S3에 업로드하는 유틸리티
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const crypto = require('crypto');

// S3 클라이언트 초기화
let s3Client = null;

function initializeS3Client() {
  if (!s3Client && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

/**
 * S3가 설정되어 있는지 확인
 */
function isS3Configured() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET);
}

/**
 * 파일명을 고유하게 생성
 */
function generateUniqueFileName(originalName) {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const hash = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();

  // 안전한 파일명 생성 (공백과 특수문자 제거)
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();

  return `${safeName}-${timestamp}-${hash}${ext}`;
}

/**
 * 파일을 S3에 업로드
 *
 * @param {Buffer|Stream} fileBuffer - 업로드할 파일 데이터
 * @param {string} originalName - 원본 파일명
 * @param {string} folder - S3 내 폴더 경로 (예: 'avatars', 'books/covers')
 * @param {string} contentType - 파일 MIME 타입
 * @returns {Promise<{url: string, key: string}>} - 업로드된 파일의 URL과 key
 */
async function uploadToS3(fileBuffer, originalName, folder = '', contentType = 'application/octet-stream') {
  if (!isS3Configured()) {
    throw new Error('AWS S3가 설정되지 않았습니다. 환경 변수를 확인하세요.');
  }

  const client = initializeS3Client();
  const bucket = process.env.AWS_S3_BUCKET;

  // 고유한 파일명 생성
  const fileName = generateUniqueFileName(originalName);
  const key = folder ? `${folder}/${fileName}` : fileName;

  try {
    // 대용량 파일 업로드 지원
    const upload = new Upload({
      client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read', // 또는 'private' (필요에 따라 변경)
      },
    });

    await upload.done();

    // 업로드된 파일의 URL 생성
    const url = process.env.AWS_CLOUDFRONT_URL
      ? `${process.env.AWS_CLOUDFRONT_URL}/${key}` // CloudFront 사용 시
      : `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error('S3 업로드 오류:', error);
    throw new Error('파일 업로드에 실패했습니다');
  }
}

/**
 * S3에서 파일 삭제
 *
 * @param {string} key - 삭제할 파일의 S3 key
 * @returns {Promise<void>}
 */
async function deleteFromS3(key) {
  if (!isS3Configured()) {
    throw new Error('AWS S3가 설정되지 않았습니다');
  }

  const client = initializeS3Client();
  const bucket = process.env.AWS_S3_BUCKET;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);
  } catch (error) {
    console.error('S3 삭제 오류:', error);
    throw new Error('파일 삭제에 실패했습니다');
  }
}

/**
 * S3 파일에 대한 Presigned URL 생성 (일시적 접근 권한)
 *
 * @param {string} key - 파일의 S3 key
 * @param {number} expiresIn - URL 유효 시간 (초), 기본 1시간
 * @returns {Promise<string>} - Presigned URL
 */
async function getPresignedUrl(key, expiresIn = 3600) {
  if (!isS3Configured()) {
    throw new Error('AWS S3가 설정되지 않았습니다');
  }

  const client = initializeS3Client();
  const bucket = process.env.AWS_S3_BUCKET;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned URL 생성 오류:', error);
    throw new Error('URL 생성에 실패했습니다');
  }
}

/**
 * URL에서 S3 key 추출
 *
 * @param {string} url - S3 또는 CloudFront URL
 * @returns {string|null} - 추출된 key 또는 null
 */
function extractKeyFromUrl(url) {
  try {
    if (!url) return null;

    const urlObj = new URL(url);

    // S3 URL 형식
    if (urlObj.hostname.includes('s3')) {
      return urlObj.pathname.substring(1); // 앞의 '/' 제거
    }

    // CloudFront URL 형식
    if (process.env.AWS_CLOUDFRONT_URL && url.startsWith(process.env.AWS_CLOUDFRONT_URL)) {
      return url.replace(process.env.AWS_CLOUDFRONT_URL + '/', '');
    }

    return null;
  } catch (error) {
    console.error('Key 추출 오류:', error);
    return null;
  }
}

/**
 * 로컬 저장소 또는 S3에 파일 업로드 (자동 전환)
 *
 * @param {Object} file - Multer file object
 * @param {string} folder - 저장 폴더
 * @returns {Promise<string>} - 파일 URL
 */
async function uploadFile(file, folder = 'uploads') {
  if (isS3Configured()) {
    // S3 사용
    const { url } = await uploadToS3(file.buffer, file.originalname, folder, file.mimetype);
    return url;
  } else {
    // 로컬 저장소 사용 (기존 방식)
    const localPath = `/uploads/${folder}/${file.filename}`;
    return localPath;
  }
}

/**
 * 파일 삭제 (S3 또는 로컬)
 *
 * @param {string} fileUrl - 삭제할 파일의 URL 또는 경로
 * @returns {Promise<void>}
 */
async function deleteFile(fileUrl) {
  if (isS3Configured() && fileUrl.includes('s3') || fileUrl.includes('cloudfront')) {
    // S3 파일 삭제
    const key = extractKeyFromUrl(fileUrl);
    if (key) {
      await deleteFromS3(key);
    }
  } else {
    // 로컬 파일 삭제
    const fs = require('fs').promises;
    const path = require('path');
    const filePath = path.join(__dirname, '..', fileUrl);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 파일이 이미 없으면 무시
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

module.exports = {
  isS3Configured,
  uploadToS3,
  deleteFromS3,
  getPresignedUrl,
  extractKeyFromUrl,
  uploadFile,
  deleteFile,
  generateUniqueFileName,
};
