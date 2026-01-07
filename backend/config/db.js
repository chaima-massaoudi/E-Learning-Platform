/**
 * =========================================================================
 * CONFIGURATION DE LA BASE DE DONNÉES MONGODB
 * =========================================================================
 * 
 * Ce fichier gère la connexion à la base de données MongoDB
 * en utilisant Mongoose comme ODM (Object Document Mapper).
 * 
 * Mongoose permet de:
 * - Définir des schémas de données
 * - Effectuer des validations
 * - Créer des relations entre les documents
 * 
 * @author Chaima Massaoudi
 */

// Importation de Mongoose - ODM pour MongoDB
const mongoose = require('mongoose');

/**
 * Fonction de connexion à MongoDB
 * 
 * Cette fonction asynchrone établit la connexion à la base de données
 * MongoDB en utilisant l'URI défini dans les variables d'environnement.
 * 
 * En cas d'échec de connexion, l'application se termine avec un code d'erreur.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // Tentative de connexion à MongoDB
        // mongoose.connect() retourne une promesse
        // MONGO_URI est défini dans le fichier .env (ex: mongodb://localhost:27017/elearning)
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // Afficher un message de succès avec le nom de l'hôte
        // conn.connection.host contient l'adresse du serveur MongoDB
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // En cas d'erreur de connexion, afficher l'erreur
        console.error(`Error: ${error.message}`);

        // Terminer le processus Node.js avec un code d'erreur (1)
        // Cela empêche le serveur de démarrer sans base de données
        process.exit(1);
    }
};

// Exporter la fonction pour l'utiliser dans server.js
module.exports = connectDB;
