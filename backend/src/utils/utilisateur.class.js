/**
 * Classe utilitaire pour les opérations sur les utilisateurs
 * @class Utilisateur
 */
class Utilisateur {
    constructor(id, nom, prenom, email, roles = ['ETUDIANT']) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.roles = roles;
        this.statut = 'ACTIF';
        this.creeLe = new Date();
        this.majLe = new Date();
        this.dernierConnexion = null;
        this.tentativesConnexion = 0;
        this.verrouilleJusqua = null;
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     * @param {string} role - Rôle à vérifier
     * @returns {boolean} - True si l'utilisateur a le rôle
     */
    hasRole(role) {
        return this.roles.includes(role);
    }

    /**
     * Vérifie si l'utilisateur est un administrateur
     * @returns {boolean} - True si l'utilisateur est un administrateur
     */
    isAdmin() {
        return this.hasRole('ADMIN');
    }

    /**
     * Vérifie si l'utilisateur est un enseignant
     * @returns {boolean} - True si l'utilisateur est un enseignant
     */
    isEnseignant() {
        return this.hasRole('ENSEIGNANT');
    }

    /**
     * Vérifie si l'utilisateur est un étudiant
     * @returns {boolean} - True si l'utilisateur est un étudiant
     */
    isEtudiant() {
        return this.hasRole('ETUDIANT');
    }

    /**
     * Vérifie si l'utilisateur est un modérateur
     * @returns {boolean} - True si l'utilisateur est un modérateur
     */
    isModerateur() {
        return this.hasRole('MODERATEUR');
    }

    /**
     * Ajoute un rôle à l'utilisateur
     * @param {string} role - Rôle à ajouter
     */
    ajouterRole(role) {
        if (!this.roles.includes(role)) {
            this.roles.push(role);
            this.majLe = new Date();
        }
    }

    /**
     * Retire un rôle à l'utilisateur
     * @param {string} role - Rôle à retirer
     */
    retirerRole(role) {
        const index = this.roles.indexOf(role);
        if (index > -1) {
            this.roles.splice(index, 1);
            this.majLe = new Date();
        }
    }

    /**
     * Met à jour le statut de l'utilisateur
     * @param {string} statut - Nouveau statut
     */
    mettreAJourStatut(statut) {
        this.statut = statut;
        this.majLe = new Date();
    }

    /**
     * Enregistre une tentative de connexion
     * @param {boolean} succes - Si la tentative est réussie
     */
    enregistrerTentativeConnexion(succes) {
        if (succes) {
            this.dernierConnexion = new Date();
            this.tentativesConnexion = 0;
            this.verrouilleJusqua = null;
        } else {
            this.tentativesConnexion++;
            if (this.tentativesConnexion >= 5) {
                this.verrouilleJusqua = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                this.statut = 'SUSPENDU';
            }
        }
        this.majLe = new Date();
    }

    /**
     * Vérifie si le compte est verrouillé
     * @returns {boolean} - True si le compte est verrouillé
     */
    estVerrouille() {
        if (!this.verrouilleJusqua) return false;
        return new Date() < new Date(this.verrouilleJusqua);
    }

    /**
     * Réinitialise les tentatives de connexion
     */
    reinitialiserTentativesConnexion() {
        this.tentativesConnexion = 0;
        this.verrouilleJusqua = null;
        if (this.statut === 'SUSPENDU') {
            this.statut = 'ACTIF';
        }
        this.majLe = new Date();
    }

    /**
     * Vérifie si le compte est actif
     * @returns {boolean} - True si le compte est actif
     */
    estActif() {
        return this.statut === 'ACTIF' && !this.estVerrouille();
    }

    /**
     * Retourne le nom complet de l'utilisateur
     * @returns {string} - Nom complet
     */
    getNomComplet() {
        return `${this.prenom} ${this.nom}`;
    }

    /**
     * Retourne les initiales de l'utilisateur
     * @returns {string} - Initiales
     */
    getInitiales() {
        return `${this.prenom.charAt(0)}${this.nom.charAt(0)}`.toUpperCase();
    }

    /**
     * Convertit l'instance en objet simple
     * @returns {Object} - Objet simple
     */
    toJSON() {
        return {
            id: this.id,
            nom: this.nom,
            prenom: this.prenom,
            email: this.email,
            roles: this.roles,
            statut: this.statut,
            dernierConnexion: this.dernierConnexion,
            creeLe: this.creeLe,
            majLe: this.majLe,
            tentativesConnexion: this.tentativesConnexion,
            verrouilleJusqua: this.verrouilleJusqua
        };
    }

    /**
     * Crée une instance à partir d'un objet simple
     * @param {Object} data - Données de l'utilisateur
     * @returns {Utilisateur} - Instance de la classe Utilisateur
     */
    static fromJSON(data) {
        const utilisateur = new Utilisateur(
            data.id,
            data.nom,
            data.prenom,
            data.email,
            data.roles
        );
        utilisateur.statut = data.statut;
        utilisateur.dernierConnexion = data.dernierConnexion ? new Date(data.dernierConnexion) : null;
        utilisateur.creeLe = new Date(data.creeLe);
        utilisateur.majLe = new Date(data.majLe);
        utilisateur.tentativesConnexion = data.tentativesConnexion;
        utilisateur.verrouilleJusqua = data.verrouilleJusqua ? new Date(data.verrouilleJusqua) : null;
        return utilisateur;
    }
}

module.exports = Utilisateur; 