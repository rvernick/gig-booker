import {
  DeleteObjectCommand,
  GetObjectCommand,
  paginateListObjectsV2,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ensureString } from './utils';

const photoBucketName = 'cup-of-sugar-profile-photos';

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: ensureString(process.env.AWS_S3_ACCESS_KEY_ID),
    secretAccessKey: ensureString(process.env.AWS_S3_SECRET_ACCESS_KEY),
  },
});

export const uploadPhoto = async (file: Express.Multer.File): Promise<{ bucket: string; key: string } | null> => {
  try {
    const key = `${Date.now()}-${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: photoBucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return { bucket: photoBucketName, key: key };
  } catch (error) {
    console.error('Error uploading photo: ', error);
    return null;
  }
};

export const deleteBikePhoto = async (bucket: string, key: string): Promise<void> => {
  try {
    const deleteResult = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    console.log('info', 'Deleted photo from: ', deleteResult);
  } catch (error) {
    console.error('Error deleting photo: ', error);
  }
};

export const refreshS3Url = (bucket: string, key: string, expireInSeconds: number): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expireInSeconds });
};

export const listBikePhotos = async (): Promise<string[]> => {
  try {
    const result: string[] = [];
    const paginator = paginateListObjectsV2({ client: s3Client }, { Bucket: photoBucketName });
    for await (const page of paginator) {
      const objects = page.Contents;
      if (objects) {
        // For every object in each page, delete it.
        for (const object of objects) {
          result.push(ensureString(object.Key));
        }
      }
    }
    return result;
  } catch (error) {
    console.error('Error listing photos: ', error);
    return [];
  }
};
