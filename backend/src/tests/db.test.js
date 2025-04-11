// 📁 test/db-test.js
const { getDatabase } = require('../config/db');

(async () => {
    try {
        const db = await getDatabase("Walid");
        const response = await db.command({ ping: 1 });
        console.log("📡 Ping MongoDB réussi :", response);
    } catch (err) {
        console.error("❌ Erreur MongoDB :", err);
    } finally {
        process.exit(0);
    }
})();
