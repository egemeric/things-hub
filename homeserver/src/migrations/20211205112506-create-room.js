"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Rooms", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      roomName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      homeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references:{
          model:{
            tableName:'Homes',
          },
          key:'homeId'
        }
      },
      users: {
        type: Sequelize.JSON,
      },
      roomId: {
        type: Sequelize.UUID,
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
    await queryInterface.dropTable("Rooms");
  },
};
