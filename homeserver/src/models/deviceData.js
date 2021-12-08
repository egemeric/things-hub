"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DeviceData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DeviceData.belongsTo(models.Device, { allowNull: false });
    }
  }
  DeviceData.init(
    {
      date : DataTypes.DATE,
      dataType: DataTypes.STRING,
      publishPoints: DataTypes.JSON,
      data: DataTypes.STRING(1024)
    },
    {
      sequelize,
      modelName: "DeviceData",
    }
  );
  return DeviceData;
};
