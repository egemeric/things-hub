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
      this.hasMany(models.Room);
      this.hasMany(models.Device);
    }
  }
  Home.init(
    {
      aliasName: { type: DataTypes.STRING, unique: true },
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
