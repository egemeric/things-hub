const db = require("../models");

const setInitialDb = () => {
  db.sequelize.sync().then(async () => {
    let home = await db["Home"]
      .build({
        aliasName: "home",
        phone: "02123234232",
        address: "Ankara/Cankaya",
        ipAdress: "127.0.0.1",
      })
      .save()
      .then((obj) => {
        db["Room"].create({
          roomName: "egemeric",
          HomeId: obj.id,
        });
      })
      .catch((error) => console.log(error));
      console.log(home)
  });
};

module.exports = setInitialDb;
