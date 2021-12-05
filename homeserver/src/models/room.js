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
      Room.belongsTo(models.Home, { foreignKey: "homeId", as: "home" });
    }
  }
  Room.init(
    {
      roomName: { type: DataTypes.STRING, allowNull: false },
      homeId: DataTypes.UUID,
      users: DataTypes.JSON,
      roomId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      sequelize,
      modelName: "Room",
    }
  );
  return Room;
};
