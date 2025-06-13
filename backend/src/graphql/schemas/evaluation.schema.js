extend type Mutation {
    creerEvaluation(input: EvaluationInput!): Evaluation!
    mettreAJourEvaluation(id: ID!, input: EvaluationUpdateInput!): Evaluation!
    supprimerEvaluation(id: ID!): Boolean!
} 