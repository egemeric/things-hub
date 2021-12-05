"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    let uuid = randomUUID();

    await queryInterface.bulkInsert("Homes", [
      {
        aliasName: "home",
        phone: "02122345643",
        adress: "ankara/cankaya",
        ipAdress: "127.0.0.1",
        homeId: uuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("Rooms", [
      {
        roomName: "egemeric",
        homeId: uuid,
        roomId: randomUUID(),
        users: JSON.stringify({users:['egemeric','sevil']}),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
      await queryInterface.bulkDelete('People', null, {});
     */
  },
};
