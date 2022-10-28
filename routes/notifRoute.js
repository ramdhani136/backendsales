const express = require("express");
const router = express.Router();
const notif = require("../controllers/notifController");

// router.post("/", notif.create);
router.get("/", notif.getAll);
// router.get("/:id", notif.getOneBranch);
// router.put("/:id", notif.updateBranch);
// router.delete("/:id", notif.deleteBranch);

module.exports = router;
