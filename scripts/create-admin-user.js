/**
 * Script zum Erstellen eines neuen Admin-Users
 * 
 * Verwendung:
 * 1. Installiere Firebase Admin SDK: npm install firebase-admin
 * 2. Erstelle einen Service Account Key in der Firebase Console
 * 3. Setze GOOGLE_APPLICATION_CREDENTIALS Umgebungsvariable
 * 4. Führe aus: node scripts/create-admin-user.js
 * 
 * Oder verwende die Admin-Seite im Panel: /admin/users/new
 */

const admin = require('firebase-admin');

// Initialisiere Firebase Admin (wenn noch nicht initialisiert)
if (!admin.apps.length) {
  try {
    // Versuche Service Account zu laden
    const serviceAccount = require('../service-account-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Fehler beim Initialisieren von Firebase Admin:');
    console.error('Bitte erstelle eine service-account-key.json Datei oder setze GOOGLE_APPLICATION_CREDENTIALS');
    console.error('Siehe: https://firebase.google.com/docs/admin/setup');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function createAdminUser(email, password, name) {
  try {
    // 1. Firebase Auth User erstellen
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false,
    });

    console.log('✅ Firebase Auth User erstellt:', userRecord.uid);

    // 2. Firestore User-Dokument erstellen
    await db.collection('users').doc(userRecord.uid).set({
      name: name,
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Firestore User-Dokument erstellt');
    console.log('\n🎉 Admin-User erfolgreich erstellt!');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   E-Mail: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Rolle: admin\n`);

    return userRecord;
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Admin-Users:', error);
    throw error;
  }
}

// Beispiel-Verwendung (wenn direkt ausgeführt)
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Verwendung: node scripts/create-admin-user.js <email> <password> <name>');
    console.log('Beispiel: node scripts/create-admin-user.js admin@example.com "securePassword123" "Admin User"');
    process.exit(1);
  }

  const [email, password, name] = args;
  
  createAdminUser(email, password, name)
    .then(() => {
      console.log('✅ Fertig!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fehler:', error.message);
      process.exit(1);
    });
}

module.exports = { createAdminUser };
