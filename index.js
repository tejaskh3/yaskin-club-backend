const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI, Modality } = require('@google/genai');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;


const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'yaskin.club backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/generate-poster', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageFile = req.file;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt text is required'
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    const imageBase64 = imageFile.buffer.toString('base64');
    const imageMimeType = imageFile.mimetype;

    console.log('🎨 Generating poster with Gemini AI...');


    try {

      const fullPrompt = `Create a beautiful birthday poster that incorporates this person's photo with the following message: "${prompt}". 

      Design requirements:
      - Use the person's photo as the central element
      - Add festive birthday elements: balloons, confetti, party hats, cake
      - Use bright, celebratory colors (purple, pink, gold, blue)
      - Include the birthday message prominently and stylishly
      - Make it professional yet fun for workplace celebrations
      - Add birthday-themed decorative borders
      - Ensure high visual impact and readability
      
      Generate a beautiful birthday poster image.`;

      const contents = [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        },
      ];

      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      let generatedImageBase64 = null;
      let description = null;

      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            description = part.text;
          } else if (part.inlineData) {
            generatedImageBase64 = part.inlineData.data;
          }
        }
      }

      if (generatedImageBase64) {
        console.log('✅ Image generated successfully!');
        return res.json({
          success: true,
          data: {
            imageBase64: generatedImageBase64,
            description: description || 'Birthday poster generated successfully!',
            prompt: prompt,
            message: 'AI poster generated successfully!',
            mimeType: 'image/png'
          }
        });
      } else {
        console.log('⚠️ No image generated, falling back to description mode');
        return res.json({
          success: true,
          data: {
            description: description || 'AI poster description generated successfully!',
            prompt: prompt,
            message: 'Poster description generated successfully! (Image generation not available)',
            fallbackMode: true
          }
        });
      }

    } catch (imageGenError) {
      console.log('⚠️ Image generation failed, trying text-only mode:', imageGenError.message);
      
      try {
        const textPrompt = `Based on this uploaded image and the message "${prompt}", create a detailed description for a beautiful birthday poster design. Include specific details about layout, colors, decorative elements (balloons, confetti, cake), and how to incorporate the person's photo effectively. Make it professional yet fun for workplace celebrations.`;

        const textContents = [
          { text: textPrompt },
          {
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64,
            },
          },
        ];

        const textResponse = await genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: textContents,
        });

        const description = textResponse.response.text();

        return res.json({
          success: true,
          data: {
            description: description,
            prompt: prompt,
            message: 'Poster description generated successfully! (Image generation temporarily unavailable)',
            fallbackMode: true
          }
        });

      } catch (textError) {
        throw textError;
      }
    }

  } catch (error) {
    console.error('❌ Error generating poster:', error);
    
    if (error.message.includes('quota') || error.message.includes('billing')) {
      return res.status(429).json({
        success: false,
        error: 'API quota exceeded. Please try again later.',
        details: 'The Gemini API has usage limits. Please wait a moment and try again.'
      });
    }

    if (error.message.includes('API key')) {
      return res.status(401).json({
        success: false,
        error: 'API authentication failed.',
        details: 'Please check your Gemini API key configuration.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate poster',
      details: error.message
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});


app.listen(port, () => {
  console.log(`🚀 yaskin.club backend running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
  console.log(`🎨 AI Poster Generation: http://localhost:${port}/api/generate-poster`);
}); 