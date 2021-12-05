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
    await queryInterface.bulkDelete('Homes', null, {});
    await queryInterface.bulkDelete('Rooms', null, {});
  },
};
