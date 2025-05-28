/**
 * Fichier central pour les resolvers GraphQL
 * Combine tous les resolvers spécifiques en un seul objet
 *
 * @module graphql/resolvers/index
 * @created 2025-05-27 par WalidBenTouhami
 * @updated 2025-05-28 par WalidBenTouhami
 */

'use strict';

const resolvers = require('./resolvers');
const DataLoader = require('dataloader');
const logger = require('../utils/logger');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');

function createLoaders() {
    logger.debug('Initialisation des DataLoaders GraphQL');
    return {
        projetLoader: new DataLoader(async (ids) => {
            logger.debug(`Chargement de ${ids.length} projets par DataLoader`);
            const projets = await Projet.find({ _id: { $in: ids } }).lean().exec();
            const projetsMap = {};
            (projets || []).forEach(projet => {
                if (projet && projet._id) {
                    projetsMap[projet._id.toString()] = projet;
                }
            });
            return ids.map(id => projetsMap[id.toString()] || null);
        }, { cache: true }),
        livrableLoader: new DataLoader(async (ids) => {
            logger.debug(`Chargement de ${ids.length} livrables par DataLoader`);
            const livrables = await Livrable.find({ _id: { $in: ids } }).lean().exec();
            const livrablesMap = {};
            (livrables || []).forEach(livrable => {
                if (livrable && livrable._id) {
                    livrablesMap[livrable._id.toString()] = livrable;
                }
            });
            return ids.map(id => livrablesMap[id.toString()] || null);
        }, { cache: true }),
        livrablesByProjetLoader: new DataLoader(async (projetIds) => {
            logger.debug(`Chargement des livrables pour ${projetIds.length} projets par DataLoader`);
            const livrables = await Livrable.find({ projetId: { $in: projetIds } }).lean().exec();
            const livrablesMap = {};
            for (const id of projetIds) {
                livrablesMap[id.toString()] = [];
            }
            for (const livrable of (livrables || [])) {
                if (livrable && livrable.projetId) {
                    const projetId = livrable.projetId.toString();
                    if (livrablesMap[projetId]) {
                        livrablesMap[projetId].push(livrable);
                    }
                }
            }
            return projetIds.map(id => livrablesMap[id.toString()] || []);
        }, { cache: true })
    };
}

function initLoaders() {
    return createLoaders();
}

exports.resolvers = resolvers;
exports.initLoaders = initLoaders;