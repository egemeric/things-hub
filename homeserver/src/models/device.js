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
      Device.belongsTo(models.Room, { foreignKey: "roomId", as: "room" });
      Device.belongsTo(models.Home, { foreignKey: "homeId", as: "home" });
    }
  }
  Device.init(
    {
      deviceName: { type: DataTypes.STRING, allowNull: false },
      homeId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      roomId: DataTypes.UUID,
      deviceId: DataTypes.UUID,
      deviceEndpoints: DataTypes.JSON,
      users: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "Device",
    }
  );
  return Device;
};
