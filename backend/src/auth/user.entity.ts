import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToOne,
  VirtualColumn,
} from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';
import * as bcrypt from 'bcrypt';
import { Household as Household } from './household.entity';
import { GeographicLocation } from './geographic-location.entity';
import { S3Media } from '../media/aws-media.entity';

export enum Source {
  GIG_BOOKER = 'gig_booker',
  GOOGLE = 'google',
}

export const createNewUser = (username: string, password: string, type: Source): User => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = new User(username, hashedPassword, type);
  return newUser;
};

const key = process.env.COLUMN_ENCRYPTION_KEY || 'your-key-here';

@Entity({
  name: 'gb_user',
})
@Index(['username', 'deletedOn'], { unique: true })
export class User {
  constructor(username: string, pass: string, type: Source) {
    if (username != null && username.length > 0) {
      this.username = username.toLowerCase();
    } else {
      this.username = username;
    }
    this.password = pass;
    this.source = type;
  }

  comparePassword(candidatePassword: string): boolean {
    return bcrypt.compareSync(candidatePassword, this.password);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'household_id', type: 'int', nullable: true })
  household_id: number | null;

  @ManyToOne(() => Household, { nullable: true, cascade: false, eager: true })
  @JoinColumn({ name: 'household_id' })
  household: Household | null;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'google_id',
    transformer: new EncryptionTransformer({
      key: key,
      algorithm: 'aes-256-gcm',
      ivLength: 16,
    }),
  })
  googleId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'google_id_token',
    transformer: new EncryptionTransformer({
      key: key,
      algorithm: 'aes-256-gcm',
      ivLength: 16,
    }),
  })
  googleIdToken: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'google_photo_url',
  })
  googlePhotoUrl: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;

  setRawPassword(rawPassword: string) {
    this.password = bcrypt.hashSync(rawPassword, 10);
  }

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'email_verified',
  })
  emailVerified: boolean;

  @Column({
    type: 'varchar',
    name: 'first_name',
    nullable: true,
  })
  firstName: string | null;

  @Column({
    type: 'varchar',
    name: 'last_name',
    nullable: true,
  })
  lastName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  mobile: string | null;

  @Column({ nullable: true, name: 'stripe_account_id' })
  stripeAccountId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'linkedin_link',
  })
  linkedInLink: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'instagram_link',
  })
  instagramLink: string | null;

  @OneToOne(() => GeographicLocation, {
    nullable: true,
    cascade: false,
    eager: true,
  })
  @JoinColumn({ name: 'home_location_id' })
  homeLocation: GeographicLocation | null;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'push_token',
    transformer: new EncryptionTransformer({
      key: key,
      algorithm: 'aes-256-gcm',
      ivLength: 16,
    }),
  })
  pushToken: string | null;

  @Column({
    type: 'enum',
    enum: Source,
    default: Source.GIG_BOOKER,
    nullable: false,
  })
  source: Source;

  @Column({ name: 'photo_id', type: 'int', nullable: true })
  photoId: number | null;

  @OneToOne(() => S3Media, {
    nullable: true,
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'photo_id' })
  photo: S3Media | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'agreed_to_terms_and_conditions',
  })
  agreedToTermsAndConditions: boolean;

  /*
  unscheduledRequests: 0,
    scheduledServices: 0,
    **/
  @VirtualColumn({
    query: (alias) => `SELECT COUNT("id") FROM "help_request" WHERE "user_id" = ${alias}.id `,
  })
  unscheduledRequests: number;

  // @VirtualColumn({
  //   query: (alias) =>
  //     `SELECT COUNT("id") FROM "help_offer" WHERE "user_id" = ${alias}.id AND state in ("Scheduled", "Started")`,
  // })
  // scheduledServices: number;

  @DeleteDateColumn({
    name: 'deleted_on',
  })
  deletedOn: boolean;

  @CreateDateColumn({
    name: 'created_on',
  })
  createdOn: Date;

  @UpdateDateColumn({
    name: 'updated_on',
  })
  updatedOn: Date;
}
