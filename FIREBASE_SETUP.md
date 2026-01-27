# Firebase Setup Guide for Cineverse

## Step-by-Step Firebase Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select your existing project
3. If creating new project:
   - Enter project name: `cineverse`
   - Disable Google Analytics (optional)
   - Click "Create project"

### 2. Enable Firebase Services

#### Enable Firestore Database:
1. In Firebase Console, click "Firestore Database" from the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select your preferred region (closest to your users)

#### Enable Authentication:
1. Click "Authentication" from the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 3. Create Admin User

1. In Firebase Console, go to "Authentication" → "Users"
2. Click "Add user"
3. Enter email and password for your admin account
4. Click "Add user"

### 4. Configure Security Rules

1. In Firebase Console, go to "Firestore Database" → "Rules" tab
2. Replace the existing rules with the content from `firestore.rules` file in your project
3. Click "Publish"

### 5. Environment Variables Setup

Create a `.env.local` file in your project root with these variables:

```env
# Firebase Admin SDK Credentials (for server-side operations)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# You can get these from Firebase Console:
# 1. Go to Project Settings → Service Accounts
# 2. Click "Generate new private key"
# 3. Download the JSON file
# 4. Extract the values from the JSON file
```

### 6. Install Dependencies

The required packages are already installed:
- `firebase` (client-side SDK)
- `firebase-admin` (server-side SDK)

### 7. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin/login`
3. Login with your Firebase admin credentials
4. Try adding/editing/deleting content
5. Visit the homepage to see content displayed

## Important Notes

- **Public Access**: Content is publicly readable (no login required for users)
- **Admin Protection**: Only authenticated admins can create/update/delete content
- **Email/Password Only**: Admin authentication uses Email/Password method only
- **No User Signup**: There's no user registration system

## Troubleshooting

### Common Issues:

1. **"auth/invalid-credential" error**:
   - Make sure you're using the correct email/password
   - Check that the user exists in Firebase Authentication

2. **Permission denied errors**:
   - Verify Firestore security rules are deployed
   - Ensure you're logged in as an admin

3. **Content not showing**:
   - Check that content exists in Firestore
   - Verify Firestore rules allow public read access

## Migration from Existing Data

If you have existing content in your Prisma database:

1. Export your existing data
2. Create a migration script to import data into Firestore
3. Or manually recreate content through the admin panel

The new system will automatically use Firestore for all content operations.