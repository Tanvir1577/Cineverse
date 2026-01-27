// Test script to verify Firebase integration
// Run: node scripts/test-firebase.js

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testFirebase() {
  try {
    console.log('Testing Firebase integration...\n');

    // Initialize Firebase Admin
    const adminApp = getApps().length === 0 
      ? initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        }) 
      : getApps()[0];

    const firestore = getFirestore(adminApp);
    
    // Test: Create a test document
    console.log('1. Testing document creation...');
    const testDoc = {
      title: 'Test Content',
      contentType: 'Movie',
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await firestore.collection('test-content').add(testDoc);
    console.log('✓ Document created successfully with ID:', docRef.id);
    
    // Test: Read the document back
    console.log('\n2. Testing document retrieval...');
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log('✓ Document retrieved successfully:', docSnap.data());
    } else {
      console.log('✗ Document not found');
    }
    
    // Test: Query documents
    console.log('\n3. Testing query operations...');
    const querySnapshot = await firestore.collection('test-content')
      .where('contentType', '==', 'Movie')
      .get();
    
    console.log(`✓ Found ${querySnapshot.size} documents matching query`);
    
    // Test: Delete test document
    console.log('\n4. Testing document deletion...');
    await docRef.delete();
    console.log('✓ Document deleted successfully');
    
    // Test: Check if content collection exists
    console.log('\n5. Checking content collection...');
    const contentSnapshot = await firestore.collection('content').limit(1).get();
    console.log(`✓ Content collection accessible (${contentSnapshot.size} documents found)`);
    
    console.log('\n🎉 All Firebase tests passed! Integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    console.error('Please check your Firebase configuration and credentials.');
    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  testFirebase();
}

module.exports = { testFirebase };