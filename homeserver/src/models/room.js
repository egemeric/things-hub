"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Home);
    }
  }
  Room.init(
    {
      roomName: { type: DataTypes.STRING, allowNull: false },
      users: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "Room",
    }
  );
  return Room;
};
