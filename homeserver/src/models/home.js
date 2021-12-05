"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Home extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Home.init(
    {
      aliasName: { type: DataTypes.STRING, unique: true },
      homeId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      phone: DataTypes.STRING,
      adress: DataTypes.STRING,
      ipAdress: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Home",
    }
  );
  return Home;
};
