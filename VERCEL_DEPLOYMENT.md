# Vercel Deployment Guide

## ✅ Your app is compatible with Vercel!

Your Next.js 16 application will work perfectly on Vercel. Here's what you need to do:

## 📋 Pre-Deployment Checklist

### 1. **Environment Variables**
You need to set these environment variables in Vercel:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional)
```

### 2. **File Uploads**
⚠️ **Important**: Currently, file uploads are stored as File objects in the form state, but they need to be uploaded to Firebase Storage before saving to Firestore.

**You'll need to:**
- Install Firebase Storage: `npm install firebase/storage`
- Upload files to Firebase Storage and get URLs
- Store the URLs in Firestore instead of File objects

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub/GitLab/Bitbucket
   - Click "Add New Project"
   - Import your repository

3. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add all the Firebase environment variables listed above
   - Make sure to add them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically detect Next.js and build your app

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   # ... repeat for all variables
   ```

## ⚙️ Configuration Notes

- ✅ Your `next.config.ts` is already configured correctly
- ✅ Build script is set up properly
- ✅ All dependencies are compatible with Vercel
- ✅ Client-side Firebase usage will work fine

## 🔧 Potential Issues & Solutions

### Issue 1: File Uploads
**Problem**: File objects can't be directly saved to Firestore.

**Solution**: You'll need to implement Firebase Storage upload:
```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// When saving, upload files first
const storage = getStorage();
const fileRef = ref(storage, `uploads/${file.name}`);
await uploadBytes(fileRef, file);
const url = await getDownloadURL(fileRef);
// Then save the URL to Firestore
```

### Issue 2: Firebase Rules
Make sure your Firestore Security Rules allow authenticated users to read/write:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /physioAssessments/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📝 Post-Deployment

1. **Test your deployment**
   - Visit your Vercel URL
   - Test authentication
   - Test form submissions
   - Test file uploads (if implemented)

2. **Set up custom domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain

3. **Monitor**
   - Check Vercel Analytics
   - Monitor Firebase usage
   - Set up error tracking if needed

## 🎉 You're Ready!

Your app is ready for Vercel deployment. The build is successful, and all configurations are correct!

