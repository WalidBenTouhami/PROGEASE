// src/modules/formation-certification/routes/certificat.routes.js

const express = require("express");
const router = express.Router();
const { authentifier } = require("../middlewares/auth");
const { createCertificat } = require("../controllers/certificatController");

router.post("/", authentifier, createCertificat);

module.exports = router;