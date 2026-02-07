#!/usr/bin/env node

const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK with Realtime Database credentials
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

try {
  // Try to initialize with default credentials first (for production)
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
      console.log('✅ Firebase initialized with application default credentials');
    } catch (error) {
      // Fallback to database URL initialization for development
      admin.initializeApp({
        databaseURL: firebaseConfig.databaseURL,
      });
      console.log('✅ Firebase initialized with database URL');
    }
  }
} catch (error) {
  console.log('Firebase initialization status:', error.message);
}

const db = admin.firestore();

async function initializeAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    console.log(`\n🔐 Setting up admin user...`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);

    const adminRef = db.collection('admins').doc('admin');
    
    await adminRef.set({
      username: username,
      password: password,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    console.log('\n✅ Admin user created/updated successfully in Firestore!');
    console.log('\n📝 You can now login with:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n🌐 Go to: http://localhost:3000/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAdmin();
