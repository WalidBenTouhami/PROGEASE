const fs = require('fs');
const path = require('path');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// Résolveurs pour le schéma
const resolvers = {
    Query: {
        health: (_, __, context) => ({
            status: "ok",
            timestamp: context.timestamp || new Date().toISOString(),
            user: context.currentUser || "WalidBenTouhami",
            version: "2.0.0",
            uptime: Math.floor(process.uptime())
        }),
        projets: async (_, __, { models }) => {
            try {
                // Implémentation simulée
                return [
                    {
                        _id: "1",
                        titre: "Projet de test",
                        description: "Description du projet",
                        statut: "En cours",
                        dateDebut: new Date().toISOString(),
                        dateFin: null
                    }
                ];
            } catch (error) {
                console.error("Erreur dans la requête projets:", error);
                return [];
            }
        },
        projet: async (_, { id }, { models }) => {
            try {
                // Implémentation simulée
                return {
                    _id: id,
                    titre: "Projet " + id,
                    description: "Description du projet " + id,
                    statut: "En cours",
                    dateDebut: new Date().toISOString(),
                    dateFin: null
                };
            } catch (error) {
                console.error(`Erreur dans la requête projet(${id}):`, error);
                return null;
            }
        },
        livrables: async () => {
            // Implémentation simulée
            return [
                {
                    _id: "1",
                    titre: "Livrable de test",
                    description: "Description du livrable",
                    statut: "À faire",
                    dateEcheance: new Date().toISOString(),
                    projetId: "1"
                }
            ];
        },
        livrable: async (_, { id }) => {
            // Implémentation simulée
            return {
                _id: id,
                titre: "Livrable " + id,
                description: "Description du livrable " + id,
                statut: "À faire",
                dateEcheance: new Date().toISOString(),
                projetId: "1"
            };
        }
    },
    Projet: {
        livrables: async (parent) => {
            // Implémentation simulée, retourne les livrables du projet
            return [
                {
                    _id: "L1",
                    titre: `Livrable pour ${parent.titre}`,
                    description: "Description du livrable",
                    statut: "À faire",
                    dateEcheance: new Date().toISOString(),
                    projetId: parent._id
                }
            ];
        }
    },
    Livrable: {
        projet: async (parent) => {
            // Implémentation simulée, retourne le projet associé au livrable
            return {
                _id: parent.projetId,
                titre: "Projet associé",
                description: "Description du projet associé",
                statut: "En cours",
                dateDebut: new Date().toISOString(),
                dateFin: null
            };
        }
    },
    Mutation: {
        createProjet: async (_, { input }) => {
            // Simuler la création
            return {
                _id: "new-" + Date.now(),
                ...input,
                dateDebut: input.dateDebut || new Date().toISOString(),
                dateFin: input.dateFin
            };
        },
        updateProjet: async (_, { id, input }) => {
            // Simuler la mise à jour
            return {
                _id: id,
                ...input,
                dateDebut: input.dateDebut || new Date().toISOString(),
                dateFin: input.dateFin
            };
        },
        deleteProjet: async (_, { id }) => {
            // Simuler la suppression
            return {
                success: true,
                message: `Projet ${id} supprimé avec succès`
            };
        },
        createLivrable: async (_, { input }) => {
            // Simuler la création
            return {
                _id: "new-" + Date.now(),
                ...input,
                dateEcheance: input.dateEcheance || new Date().toISOString()
            };
        },
        updateLivrable: async (_, { id, input }) => {
            // Simuler la mise à jour
            return {
                _id: id,
                ...input,
                dateEcheance: input.dateEcheance || new Date().toISOString()
            };
        },
        deleteLivrable: async (_, { id }) => {
            // Simuler la suppression
            return {
                success: true,
                message: `Livrable ${id} supprimé avec succès`
            };
        }
    }
};

// Chargement du schéma depuis le fichier généré par generate schema.js
let typeDefs;

try {
    console.log("[GraphQL] Tentative de chargement du schéma...");

    // Utiliser directement le fichier schema.graphql généré
    const schemaPath = path.join(__dirname, 'my-apollo-graph/graphql/schema.graphql');

    if (!fs.existsSync(schemaPath)) {
        console.log("[GraphQL] Fichier de schéma non trouvé. Génération du schéma...");

        // Exécuter le script de génération de schéma
        const generateSchemaPath = path.join(__dirname, 'scripts/generate-schema.js');
        require(generateSchemaPath);

        // Vérifier à nouveau l'existence du fichier
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Le fichier schema.graphql n'existe pas à l'emplacement: ${schemaPath}`);
        }
    }

    // Charger le fichier schema.graphql
    typeDefs = fs.readFileSync(schemaPath, 'utf8');
    console.log("[GraphQL] Schéma chargé avec succès depuis:", schemaPath);

} catch (error) {
    console.error("[GraphQL] Erreur lors du chargement du schéma:", error);
    throw new Error("Impossible de charger le schéma GraphQL: " + error.message);
}

// Création du schéma exécutable
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

console.log("[GraphQL] Schéma exécutable créé avec succès");
module.exports = { schema };