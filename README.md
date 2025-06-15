# yaskin.club Backend

AI-powered team birthday celebration platform - Backend API

## 🚀 Quick Deploy to Vercel

### Prerequisites
- [Vercel CLI](https://vercel.com/cli) installed
- Vercel account

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy from this directory**:
```bash
vercel
```

4. **Set Environment Variables**:
```bash
# Add your Gemini API key
vercel env add GEMINI_API_KEY
# Enter: AIzaSyCEI_MK7FcPpV0AU9tJOeEchUQjWBRZfvE

# Add frontend URL (update with your frontend domain)
vercel env add FRONTEND_URL
# Enter: https://your-frontend-domain.vercel.app
```

5. **Redeploy with environment variables**:
```bash
vercel --prod
```

## 🌐 API Endpoints

- **Health Check**: `GET /api/health`
- **Generate Poster**: `POST /api/generate-poster`

## 📝 Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini AI API key
- `FRONTEND_URL`: Your frontend domain for CORS
- `NODE_ENV`: Environment (production/development)

## 🔧 Local Development

```bash
npm install
npm start
```

Server runs on `http://localhost:3001`

## 📦 Dependencies

- Express.js - Web framework
- @google/genai - Gemini AI integration
- multer - File upload handling
- cors - Cross-origin resource sharing
- dotenv - Environment variables 