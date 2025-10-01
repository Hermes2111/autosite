export interface PublicUser {
	id: number;
	email: string;
	name: string;
	roles: string[];
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

