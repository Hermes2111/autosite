import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { DiecastModel } from './diecast-model.entity';

@Entity('view_events')
export class ViewEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  userId!: number | null;

  @Column({ nullable: true })
  anonymousId!: string | null;

  @Column()
  modelId!: number;

  @Column({ nullable: true })
  source!: string | null;

  @CreateDateColumn()
  viewedAt!: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User | null;

  @ManyToOne(() => DiecastModel, { nullable: false, onDelete: 'CASCADE' })
  model!: DiecastModel;
}
