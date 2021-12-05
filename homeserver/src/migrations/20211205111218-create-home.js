"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Homes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      aliasName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique:true
      },
      homeId: {
        type: Sequelize.UUID,
        unique:true
      },
      phone: {
        type: Sequelize.STRING,
      },
      adress: {
        type: Sequelize.STRING,
      },
      ipAdress: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Homes");
  },
};
