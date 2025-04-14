// src/modules/formation-certification/tests/formation.test.js

import request from "supertest";
import app from "../app";
import mongoose from "mongoose";

describe("Tests des routes Formation", () => {
  beforeAll(async () => {
    // Connexion à la base de données de test
    const dbUri = process.env.TEST_DB_URI || "mongodb://localhost:27017/testdb";
    await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    // Déconnexion de la base de données
    await mongoose.connection.close();
  });

  describe("POST /api/formations", () => {
    it("devrait créer une formation si les données sont valides", async () => {
      const formationData = {
        title: "Formation Test",
        description: "Description de la formation test",
        duration: 10,
      };

      const response = await request(app)
        .post("/api/formations")
        .send(formationData)
        .set("Authorization", "Bearer token-valide"); // Remplacez par un token valide

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("title", "Formation Test");
    });

    it("devrait retourner une erreur si les données sont invalides", async () => {
      const formationData = {
        title: "", // Titre manquant
        description: "Description invalide",
      };

      const response = await request(app)
        .post("/api/formations")
        .send(formationData)
        .set("Authorization", "Bearer token-valide");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/formations", () => {
    it("devrait retourner toutes les formations", async () => {
      const response = await request(app).get("/api/formations");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});