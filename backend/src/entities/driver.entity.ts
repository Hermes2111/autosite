import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DiecastModel } from './diecast-model.entity';

@Entity('drivers')
export class Driver {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	firstName!: string;

	@Column()
	lastName!: string;

	@ManyToMany(() => DiecastModel, model => model.drivers)
	@JoinTable({ name: 'model_driver' })
	models!: DiecastModel[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
