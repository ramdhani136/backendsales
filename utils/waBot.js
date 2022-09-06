const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const db = require("../models");
const { phoneNumberFormatter } = require("./formatter");
const myModul = require("../app");

const Device = db.devices;

const createSessionWA = async (id) => {
  const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    },
    authStrategy: new LocalAuth({ clientId: id }),
  });

  client.initialize();
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log(`QR RECEIVED ${qr}`);
    qrcode.toDataURL(qr, (err, url) => {
      myModul.setEmit("qr", { id: id, src: url });
      myModul.setEmit("message", {
        id: id,
        text: "QR Code received,scan please ..",
      });
    });
  });

  client.on("ready", () => {
    console.log("ready");
    myModul.setEmit("message", { id: id, text: "Whatsapp is ready!" });
    myModul.setEmit("ready", { id: id });
  });

  client.on("authenticated", async (session) => {
    console.log("authenticated");
    myModul.setEmit("message", { id: id, text: "Whatsapp is authenticated!" });
    myModul.setEmit("authenticated", { id: id });
  });

  client.on("auth_failure", async (session) => {
    myModul.setEmit("message", { id: id, text: "Auth eror ,restarting..." });
    client.destroy();
    client.initialize();
  });

  client.on("disconnected", async (reason) => {
    console.log("disconnected");
    myModul.setEmit("message", { id: id, text: "Whatsapp is disconnected!" });
    client.destroy();
    client.initialize();
  });

  client.on("message", async (message) => {
    const msg = await message.body;
    const fromUser = await message.from;
    const data = await db.visits.findOne({
      where: {
        name: msg,
      },
    });
    if (data === null) {
      client.sendMessage(
        phoneNumberFormatter(fromUser),
        "Data tidak di temukan, Silahkan cek kembali :)"
      );
    } else {
      if (phoneNumberFormatter(data.dataValues.phone) === fromUser) {
        client.sendMessage(
          phoneNumberFormatter(fromUser),
          "Terima kasih sudah melakukan rating :)"
        );
      } else {
        client.sendMessage(
          phoneNumberFormatter(fromUser),
          "Error, Tidak mempunyai akses :)"
        );
      }
    }
  });

  var kirimpesan = async (kontak, msg) => {
    const registered = await client.isRegisteredUser(
      phoneNumberFormatter(kontak)
    );
    if (registered) {
      await client.sendMessage(phoneNumberFormatter(kontak), msg);
      return true;
    } else {
      console.log("nomor tidak terdaftar");
      return false;
    }
  };

  module.exports.kirimpesan = kirimpesan;
};

const WaBot = async () => {
  let devices = await Device.findAll({});
  for (let i = 0; i < devices.length; i++) {
    createSessionWA(devices[i].dataValues.id);
  }
};

module.exports = {
  WaBot,
};
