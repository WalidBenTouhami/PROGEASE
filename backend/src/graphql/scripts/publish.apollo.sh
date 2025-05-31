#!/bin/bash
# Script de publication vers Apollo Studio
# Date: 2025-05-23 16:01:15
# Auteur: WalidBenTouhami

# Variables d'environnement pour Apollo
export APOLLO_KEY="user:gh.b4827a19-4fc2-45d6-b053-e935ff4a406f:--tXDlUNdpITbByFqmAnvw"
export APOLLO_GRAPH_REF="progease-app@main"
export APOLLO_SUBGRAPH_NAME="progease-projets"

echo "📡 Publication du schema GraphQL vers Apollo Studio..."
echo "🔑 Utilisation du graphe: ${APOLLO_GRAPH_REF}"
echo "🏷️ Nom du sous-graphe: ${APOLLO_SUBGRAPH_NAME}"
echo "📅 Date: 2025-05-23 16:01:15"
echo "👤 Utilisateur: WalidBenTouhami"

# Verifier l'existence du fichier schema
if [ ! -f "D:/pi/PROGEASE/backend/scripts/schema-output/schema.graphql" ]; then
    echo "❌ ERREUR: Fichier schema non trouve!"
    echo "Chemin attendu: D:/pi/PROGEASE/backend/scripts/schema-output/schema.graphql"
    exit 1
fi

# Publier le sous-graphique avec la cle GitHub
npx rover subgraph publish ${APOLLO_GRAPH_REF} \
  --schema "D:/pi/PROGEASE/backend/scripts/schema-output/schema.graphql" \
  --name "${APOLLO_SUBGRAPH_NAME}" \
  --routing-url "http://localhost:5000/graphql"

# Verifier si la commande a reussi
if [ $? -eq 0 ]; then
    echo "✅ Publication terminee avec succes!"
else
    echo "❌ echec de la publication. Verifiez les erreurs ci-dessus."
fi

# Info supplementaire
echo ""
echo "📊 Pour visualiser votre schema:"
echo "🔗 https://studio.apollographql.com/graph/${APOLLO_GRAPH_REF}/explorer"