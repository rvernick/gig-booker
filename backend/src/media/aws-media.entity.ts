import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
  PDF = 'pdf',
}

@Entity()
@Index(['bucket', 'key'], { unique: true })
export class S3Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.PHOTO,
    nullable: false,
  })
  type: MediaType;

  @Column({
    type: 'integer',
    name: 'user_id',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  bucket: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  key: string;

  @Column({
    type: 'varchar',
    name: 'presigned_url',
    nullable: true,
  })
  presignedURL: string;

  @Column({
    type: 'timestamp',
    name: 'url_expires',
    nullable: true,
  })
  urlExpires: Date;

  @DeleteDateColumn({
    name: 'deleted_on',
    nullable: true,
  })
  deletedOn: Date | null;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;
}
