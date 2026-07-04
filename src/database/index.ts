import { Sequelize, Dialect } from "sequelize";

let _sequelize: Sequelize;

const getDb = (): Sequelize => {
  if (!_sequelize) {
    _sequelize = new Sequelize(
      process.env.DB_NAME as string,
      process.env.DB_USERNAME as string,
      process.env.DB_PASSWORD as string,
      {
        host: process.env.DB_HOST,
        dialect: (process.env.DB_DIALECT as Dialect) ?? "mysql",
        port: parseInt(process.env.DB_PORT as string),
        logging: false,
      }
    );
  }
  return _sequelize;
};

export default getDb();