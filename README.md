# 🎵 AI Music Generation System

A production-ready music generation application built with PyTorch, featuring a transformer-based neural network, RESTful API, and modern web interface with glassmorphism design.

## 🚀 Features

### Core AI Capabilities
- **Transformer Architecture**: Custom GPT-style model for music generation
- **Controllable Generation**: Genre, tempo, key, and style parameters
- **Multiple Generation Modes**: Free generation, prompt-based, and style transfer
- **Real-time Inference**: Optimized for fast generation and streaming

### Modern Interface
- **Glassmorphism Design**: Beautiful, modern UI with music-themed colors
- **Real-time Updates**: WebSocket-powered live generation progress
- **Audio Visualizer**: Interactive waveform display
- **Generation History**: Track and manage all your compositions

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or bun

### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the API server
python api_server.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Install dependencies
npm i

# Start development server  
npm run dev
```

## 📚 Usage

### Web Interface

1. Open the application in your browser
2. Select your desired genre (Classical, Jazz, Rock, Pop, Electronic)
3. Adjust parameters:
   - **Tempo**: 60-200 BPM
   - **Length**: 50-500 notes
   - **Creativity**: 0.1-2.0 (temperature)
   - **Key**: Musical key signature
4. Click "Generate Music"
5. Watch real-time progress in the audio visualizer
6. Play and download your generated music

### API Endpoints

```bash
# Start generation
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "jazz",
    "tempo": 120,
    "length": 150,
    "temperature": 0.8
  }'

# Check status
curl "http://localhost:8000/status/{generation_id}"

# Download result
curl "http://localhost:8000/download/{generation_id}" -o music.json
```

## 🎨 Design System

The application features a music-themed glassmorphism design with:

- **Color Palette**: Purple to blue gradients with cyan accents
- **Glass Effects**: Translucent surfaces with backdrop blur
- **Music Visualizations**: Animated waveforms and beat indicators
- **Genre-Specific Colors**: Each music genre has its own accent color

## 🔧 Technology Stack

### Frontend
- **React**: Component-based UI
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/UI**: High-quality components
- **WebSocket**: Real-time communication

### Backend
- **FastAPI**: Modern Python web framework
- **WebSocket**: Real-time updates
- **Async/Await**: Non-blocking operations
- **Pydantic**: Data validation

## 📈 Features Overview

### 🎛️ Music Generation Controls
- Genre selection with visual cards
- Tempo, length, and creativity sliders
- Musical key selection
- Real-time parameter feedback

### 📊 Audio Visualizer
- Animated waveform bars
- Generation progress indicator
- Play/pause simulation
- Download functionality

### 📝 Generation History
- Track all compositions
- Status indicators
- Quick play and download
- Delete management

### 🌐 Real-time Updates
- WebSocket connection
- Live progress updates
- Status notifications
- Error handling

## 🎵 Supported Genres

- **Classical**: Orchestral and traditional compositions
- **Jazz**: Swing and improvisation-style music
- **Rock**: Guitar-driven and rhythmic pieces
- **Pop**: Contemporary and catchy melodies
- **Electronic**: Synthesized and digital sounds

## 🚀 Deployment

### Development
```bash
# Backend
python api_server.py

# Frontend
npm run dev
```

### Production
```bash
# Frontend (Lovable)
# Simply open Lovable and click on Share -> Publish

# Backend deployment
docker build -t ai-music-generator .
docker run -p 8000:8000 ai-music-generator
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React and Tailwind for the frontend stack
- Shadcn/UI for the beautiful components
- The AI/ML community for inspiration

---

*A demonstration of modern AI music generation with production-ready architecture and beautiful user experience.*
