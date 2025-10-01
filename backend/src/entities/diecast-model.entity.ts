import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './driver.entity';
import { Team } from './team.entity';

@Entity('diecast_models')
export class DiecastModel {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	year!: string;

	@Column()
	what!: string;

	@Column({ nullable: true })
	scale!: string;

	@Column({ nullable: true })
	specs!: string;

	@Column({ nullable: true })
	numbers!: string;

	@Column({ nullable: true })
	price!: string;

	@Column({ name: 'teamId', nullable: true })
	teamId!: number | null;

	@ManyToOne(() => Team, team => team.models, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'teamId' })
	team!: Team | null;

	@Column('text', { array: true, nullable: true, default: () => "'{}'" })
	imageUrls!: string[] | null;

	@ManyToMany(() => Driver, driver => driver.models)
	drivers!: Driver[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
