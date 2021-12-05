"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Devices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      deviceName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique:true
      },
      homeId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      roomId: {
        type: Sequelize.UUID,
      },
      deviceId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      deviceEndpoints: {
        type: Sequelize.JSON,
      },
      users: {
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Devices");
  },
};
