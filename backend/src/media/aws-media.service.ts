import { Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaType, S3Media } from './aws-media.entity';
import { deleteBikePhoto, refreshS3Url, uploadPhoto } from '../utils/aws';

@Injectable()
export class S3MediaService {
  private readonly logger = new Logger(S3MediaService.name);

  constructor(
    @InjectRepository(S3Media)
    private mediaRepository: Repository<S3Media>,
  ) {}

  async createPhoto(file: Express.Multer.File, userId: number): Promise<S3Media | null> {
    try {
      const uploadResponse = await uploadPhoto(file);
      if (!uploadResponse) {
        return Promise.resolve(null);
      }
      const { bucket, key } = uploadResponse;
      const media = this.mediaRepository.create({
        userId: userId,
        bucket: bucket,
        key: key,
        type: MediaType.PHOTO,
      });
      return this.mediaRepository.save(media);
    } catch (error) {
      this.logger.error('Error creating photo: ', error);
      return Promise.resolve(null);
    }
  }

  async deletePhoto(media: S3Media) {
    try {
      await deleteBikePhoto(media.bucket, media.key);
      await this.mediaRepository.delete(media.id);
    } catch (error) {
      this.logger.error('Error deleting photo: ', error);
    }
  }

  async refreshPhoto(media: S3Media): Promise<S3Media> {
    const fifteenMinutesInSeconds = 15 * 60;
    const newUrl = await refreshS3Url(media.bucket, media.key, fifteenMinutesInSeconds);
    media.presignedURL = newUrl;
    media.urlExpires = new Date(Date.now() + 1000 * (fifteenMinutesInSeconds - 60));
    this.logger.log('info', 'Refreshed url for: ', media);
    return this.mediaRepository.save(media);
  }

  async getPhoto(id: number): Promise<S3Media | null> {
    const media = await this.findOne(id);
    if (!media) {
      return null;
    }
    try {
      // if (isDevelopment()) this.logger.log('info', 'Getting url for: ', media);
      if (!media.urlExpires || media.urlExpires < new Date()) {
        return this.refreshPhoto(media);
      }
      return media;
    } catch (error) {
      this.logger.error('Error getting photo url: ', error);
      return null;
    }
  }

  findOne(id: number): Promise<S3Media | null> {
    const result = this.mediaRepository.findOneBy({ id });
    return result;
  }

  findAllFor(userId: number): Promise<S3Media[]> {
    return this.mediaRepository.createQueryBuilder('media').where('media.userId = :userId', { userId }).getMany();
  }

  save(media: S3Media): Promise<S3Media> {
    return this.mediaRepository.save(media);
  }
}
