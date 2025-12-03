# Video Analysis Setup Guide

## Overview
The Video Analysis section has been added to the Biomechanics assessment form. It allows users to:
- Upload multiple videos
- Ask questions about uploaded videos using OpenAI
- Store video analysis chat history

## Environment Variables Required

Add the following to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Firebase Storage Setup

1. **Enable Firebase Storage** in your Firebase Console:
   - Go to Firebase Console → Storage
   - Click "Get Started"
   - Choose "Start in production mode" or set up security rules

2. **Configure Storage Rules** (for development):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /biomechanics/{entryId}/videos/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

   **For production**, restrict access appropriately:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /biomechanics/{entryId}/videos/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == resource.metadata.uid;
       }
     }
   }
   ```

## How It Works

1. **Video Upload**:
   - Users can select multiple video files
   - Videos are uploaded to Firebase Storage
   - Progress tracking for each upload
   - Videos are organized by assessment entry ID

2. **OpenAI Integration**:
   - Users can ask questions about uploaded videos
   - Uses GPT-4 Turbo model for analysis
   - Maintains conversation history
   - Provides biomechanics-specific insights

3. **Data Storage**:
   - Video URLs and metadata stored in Firestore
   - Chat history saved with each assessment
   - Videos can be viewed or deleted

## Usage

1. Navigate to Biomechanics Assessment
2. Click on the "Video Analysis" tab
3. Click "Select Multiple Videos" to upload videos
4. Wait for uploads to complete
5. Type questions in the chat input (e.g., "Analyze the running gait pattern")
6. View AI responses in the chat history

## Limitations & Future Enhancements

**Current Implementation:**
- Uses GPT-4 Turbo text-based analysis
- Video URLs are sent to OpenAI, but actual video content analysis requires video-to-image frame extraction

**Recommended Enhancements for Full Video Analysis:**
1. Extract key frames from videos server-side
2. Use GPT-4 Vision API to analyze frames
3. Or use specialized video analysis APIs
4. Add video thumbnail previews
5. Add video playback controls in the UI

## API Endpoint

The OpenAI integration uses: `/api/openai/video-analysis`

This endpoint:
- Accepts video URLs, questions, and chat history
- Sends requests to OpenAI API
- Returns AI-generated responses

## Notes

- Videos must be saved to Firebase Storage (not base64 encoded)
- Ensure sufficient Firebase Storage quota
- OpenAI API usage will incur costs based on usage
- Consider implementing rate limiting for production use

