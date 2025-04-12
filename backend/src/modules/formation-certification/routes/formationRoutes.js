const express = require("express");
const router = express.Router();
const { authentifier } = require("../middlewares/auth");
const { validerFormation } = require("../middlewares/validate");
const { createFormation, getAllFormations } = require("../controllers/formationController");

router.post("/", authentifier, validerFormation, createFormation);
router.get("/", getAllFormations);

module.exports = router;
