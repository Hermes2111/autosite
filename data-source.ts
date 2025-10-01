import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432, 
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    
    // Zoekt naar de gecompileerde entiteiten en migraties
    entities: ['dist/**/*.entity.js'], 
    migrations: ['dist/migrations/*.js'],
    
    logging: false, 
    synchronize: false, 
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;