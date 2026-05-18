import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CoSEvent } from '../event/event.entity';

@Entity()
export class CoSEventHandled {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CoSEvent, { nullable: false, eager: true })
  @JoinColumn({ name: 'event_id' })
  event: CoSEvent;

  @Column()
  handlerName: string;

  @Column({ default: true })
  success: boolean;

  @Column('text', { nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  handledAt: Date;
}
