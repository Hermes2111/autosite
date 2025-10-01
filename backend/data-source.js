"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./src/entities/user.entity");
const team_entity_1 = require("./src/entities/team.entity");
const driver_entity_1 = require("./src/entities/driver.entity");
const diecast_model_entity_1 = require("./src/entities/diecast-model.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'devusr',
    password: process.env.DB_PASSWORD || 'devpwd',
    database: process.env.DB_NAME || 'autosite',
    entities: [user_entity_1.User, team_entity_1.Team, driver_entity_1.Driver, diecast_model_entity_1.DiecastModel],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: false,
});
//# sourceMappingURL=data-source.js.map