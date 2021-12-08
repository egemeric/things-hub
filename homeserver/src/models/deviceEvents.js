"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DeviceEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DeviceEvent.belongsTo(models.Device, { allowNull: false });
    }
  }
  DeviceEvent.init(
    {
      date : DataTypes.DATE,
      endPoint: DataTypes.STRING(1024),
      eventData: DataTypes.STRING(1024),
    },
    {
      sequelize,
      modelName: "DeviceEvent",
    }
  );
  return DeviceEvent;
};
