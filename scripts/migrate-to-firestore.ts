// Migration script to transfer data from Prisma to Firestore
// Run this script after setting up Firebase and before using the admin panel

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PrismaClient } from '@prisma/client';

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
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Fetch all content from Prisma
    const prismaContents = await prisma.content.findMany({
      include: {
        downloadGroups: {
          include: {
            links: true,
          },
        },
      },
    });

    console.log(`Found ${prismaContents.length} content items to migrate`);

    // Migrate each content item to Firestore
    for (const content of prismaContents) {
      try {
        // Prepare data for Firestore
        const firestoreData = {
          contentType: content.contentType,
          mainTitle: content.mainTitle,
          secondaryTitle: content.secondaryTitle || '',
          imageHtml: content.imageHtml,
          name: content.name || '',
          season: content.season || '',
          imdbRating: content.imdbRating || null,
          releaseYear: content.releaseYear || null,
          genre: content.genre ? JSON.parse(content.genre as string) : [],
          language: content.language ? JSON.parse(content.language as string) : [],
          subtitle: content.subtitle ? JSON.parse(content.subtitle as string) : [],
          quality: content.quality ? JSON.parse(content.quality as string) : [],
          fileSize: content.fileSize || '',
          format: content.format || '',
          storyline: content.storyline || '',
          downloadGroups: content.downloadGroups.map(group => ({
            id: group.id,
            title: group.title,
            links: group.links.map(link => ({
              id: link.id,
              title: link.title,
              url: link.url,
              quality: link.quality,
            })),
          })),
          createdAt: content.createdAt.toISOString(),
          updatedAt: content.updatedAt.toISOString(),
        };

        // Add to Firestore
        const docRef = await firestore.collection('content').add(firestoreData);
        console.log(`Migrated content: ${content.mainTitle} (ID: ${docRef.id})`);
        
      } catch (error) {
        console.error(`Failed to migrate content ${content.mainTitle}:`, error);
      }
    }

    console.log('Data migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if script is called directly
if (require.main === module) {
  migrateData().catch(console.error);
}

export { migrateData };