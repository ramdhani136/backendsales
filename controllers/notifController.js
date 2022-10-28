const db = require("../models");
const visit = require("../controllers/visitController");
const callsheet = require("../controllers/callSheetController");

const Notif = db.notif;

const getData = async (doc) => {
  return doc;
};

const getAll = async (req, res) => {
  const visits = await visit.newVisit(req.userId, "visit");
  const callsheets = await callsheet.newCallSheet(req.userId, "callsheet");
  const nol = [];
  const data = await Notif.findAll();
  let finalData = [];
  if (data.length) {
    cekPermission = data.map((item) => {
      let db;
      switch (item.doc) {
        case "visit":
          db = visits;
          break;
        case "callsheet":
          db = callsheets;
          break;
        default:
          db = nol;
          break;
      }

      let isAccess = [];
      if (db.length > 0) {
        isAccess = db.filter((i) => `${i.id}` === `${item.id_params}`);
      }
      if (isAccess.length > 0) {
        return item;
      }
    });
    finalData = cekPermission.filter((i) => i !== undefined);
  }

  res.send(finalData);
};

module.exports = { getAll };
