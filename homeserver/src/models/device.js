"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Device.belongsTo(models.Room, { allowNull: true });
      Device.belongsTo(models.Home, { allowNull: false });
    }
  }
  Device.init(
    {
      deviceName: { type: DataTypes.STRING, allowNull: false, unique: true },
      deviceEndpoints: DataTypes.JSON,
      publishPoints: DataTypes.JSON,
      users: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "Device",
    }
  );
  return Device;
};
