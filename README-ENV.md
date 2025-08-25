# Environment Variables Setup

## Required Environment Variables

Add the following variables to your `.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/krishi"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# UploadThing (for image uploads in equipment form)
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# WhatsApp Business API (optional)
WHATSAPP_ACCESS_TOKEN="your-whatsapp-access-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_VERIFY_TOKEN="your-verify-token"

# Google Gemini AI (for commodity price verification)
NEXT_PUBLIC_GEMINI_API="your-gemini-api-key-here"

# India Market API (optional - for official government data)
INDIA_API_KEY="your-india-api-key-here"
```

## UploadThing Setup

1. Create a [UploadThing](https://uploadthing.com/) account
2. Get your API key from the dashboard
3. Add the environment variables above
4. UploadThing will automatically handle image optimization and storage

### UploadThing Features:
- **File Type**: Images only (configured in uploadthing.ts)
- **Max File Size**: 4MB per image
- **Max File Count**: 5 images per upload
- **Security**: Role-based access control (FARMER only)
- **Auto-optimization**: Images are automatically optimized
- **Easy Integration**: Simple React components and API routes

## Alternative Image Upload

If you don't want to use UploadThing, you can:
1. Remove the image upload functionality from the form
2. Or implement your own image upload solution (like Cloudinary, AWS S3, etc.)
3. Update the form to accept image URLs directly

## Database Setup

1. Install PostgreSQL
2. Create a database named "krishi"
3. Update the DATABASE_URL with your credentials
4. Run `npm run db:seed` to populate with sample data
