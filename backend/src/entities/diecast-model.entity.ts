import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './driver.entity';
import { Team } from './team.entity';
import { Customer } from './customer.entity';

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

	@Column({ default: false })
	isSold!: boolean;

	@Column({ type: 'timestamp', nullable: true })
	soldDate!: Date | null;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	soldPrice!: string | null;

	@Column({ nullable: true })
	soldTo!: string | null;

	@Column({ name: 'customerId', nullable: true })
	customerId!: number | null;

	@ManyToOne(() => Customer, customer => customer.purchases, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'customerId' })
	customer!: Customer | null;

	@Column({ nullable: true })
	soldLocation!: string | null;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	shippingCost!: string | null;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	fees!: string | null;

	@Column({ default: false })
	isPaid!: boolean;

	@Column({ type: 'text', nullable: true })
	saleNotes!: string | null;

	@Column({ nullable: true })
	salesChannel!: string | null;

	@ManyToMany(() => Driver, driver => driver.models)
	drivers!: Driver[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
