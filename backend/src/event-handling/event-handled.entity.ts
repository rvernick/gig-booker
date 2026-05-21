import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GBEvent } from '../event/event.entity';

@Entity()
export class GBEventHandled {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GBEvent, { nullable: false, eager: true })
  @JoinColumn({ name: 'event_id' })
  event: GBEvent;

  @Column()
  handlerName: string;

  @Column({ default: true })
  success: boolean;

  @Column('text', { nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  handledAt: Date;
}
