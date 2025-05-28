#!/bin/bash
# Script de publication vers Apollo Studio
# Date: 2025-05-23 16:01:15
# Auteur: WalidBenTouhami

# Variables d'environnement pour Apollo
export APOLLO_KEY="user:gh.b4827a19-4fc2-45d6-b053-e935ff4a406f:--tXDlUNdpITbByFqmAnvw"
export APOLLO_GRAPH_REF="progease-app@main"
export APOLLO_SUBGRAPH_NAME="progease-projets"

echo "📡 Publication du schéma GraphQL vers Apollo Studio..."
echo "🔑 Utilisation du graphe: ${APOLLO_GRAPH_REF}"
echo "🏷️ Nom du sous-graphe: ${APOLLO_SUBGRAPH_NAME}"
echo "📅 Date: 2025-05-23 16:01:15"
echo "👤 Utilisateur: WalidBenTouhami"

# Vérifier l'existence du fichier schéma
if [ ! -f "D:/pi/PROGEASE/backend/scripts/schema-output/schema.graphql" ]; then
    echo "❌ ERREUR: Fichier schéma non trouvé!"
    echo "Chemin attendu: D:/pi/PROGEASE/backend/scripts/schema-output/schema.graphql"
    exit 1
fi

# Publier le sous-graphique avec la clé GitHub
npx rover subgraph publish ${APOLLO_GRAPH_REF} \
  --schema "D:/pi/PROGEASE/backend/scripts/schema-output/schema.graphql" \
  --name "${APOLLO_SUBGRAPH_NAME}" \
  --routing-url "http://localhost:5000/graphql"

# Vérifier si la commande a réussi
if [ $? -eq 0 ]; then
    echo "✅ Publication terminée avec succès!"
else
    echo "❌ Échec de la publication. Vérifiez les erreurs ci-dessus."
fi

# Info supplémentaire
echo ""
echo "📊 Pour visualiser votre schéma:"
echo "🔗 https://studio.apollographql.com/graph/${APOLLO_GRAPH_REF}/explorer"