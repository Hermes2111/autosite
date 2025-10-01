import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { User } from '../../entities/user.entity';
import { DiecastModel } from '../../entities/diecast-model.entity';

@Entity('watchlist_items')
@Unique(['userId', 'modelId'])
export class WatchlistItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  modelId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => DiecastModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelId' })
  model!: DiecastModel;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
