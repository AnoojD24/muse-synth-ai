from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import uvicorn
import json
import os
import logging
from pathlib import Path
import time
from datetime import datetime

app = FastAPI(title="AI Music Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GenerationRequest(BaseModel):
    genre: str = "classical"
    tempo: int = 120
    length: int = 100
    temperature: float = 0.8
    top_k: int = 50
    key: str = "C"
    mode: str = "free"
    prompt: Optional[List[int]] = None

class GenerationResponse(BaseModel):
    id: str
    status: str
    music_data: Optional[List[Dict]] = None
    midi_url: Optional[str] = None
    created_at: str
    duration: Optional[float] = None

class GenerationStatus(BaseModel):
    id: str
    status: str
    progress: int
    message: str

# In-memory storage for demo (use Redis/DB in production)
generation_tasks = {}
completed_generations = {}

# Mock music generator for demo
class MockMusicGenerator:
    def __init__(self):
        self.is_loaded = True
    
    async def generate_async(self, request: GenerationRequest) -> List[Dict]:
        """Simulate async music generation"""
        await asyncio.sleep(0.5)  # Simulate processing time
        
        # Generate mock MIDI events
        music_data = []
        current_time = 0
        base_note = 60  # Middle C
        
        # Simple progression based on genre
        if request.genre == "classical":
            pattern = [0, 2, 4, 5, 7, 9, 11, 7]
        elif request.genre == "jazz":
            pattern = [0, 3, 5, 7, 10, 8, 5, 3]
        elif request.genre == "rock":
            pattern = [0, 3, 5, 7, 5, 3, 0, 5]
        else:
            pattern = [0, 2, 4, 7, 9, 7, 4, 2]
        
        for i in range(min(request.length, 200)):
            note_offset = pattern[i % len(pattern)]
            note = base_note + note_offset + (i // 8) * 12  # Octave changes
            
            duration = 60.0 / request.tempo  # Beat duration
            if i % 4 == 0:
                duration *= 2  # Longer notes on beats
            
            music_data.append({
                "type": "note_on",
                "note": note,
                "time": current_time,
                "velocity": int(80 + (request.temperature - 0.5) * 40),
                "duration": duration
            })
            
            current_time += duration
        
        return music_data

# Initialize generator
generator = MockMusicGenerator()

@app.on_event("startup")
async def startup_event():
    logger.info("Music Generation API starting up...")
    os.makedirs("generated", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "AI Music Generator API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "generator_loaded": generator.is_loaded
    }

@app.post("/generate", response_model=GenerationResponse)
async def generate_music(request: GenerationRequest, background_tasks: BackgroundTasks):
    """Start music generation process"""
    generation_id = f"gen_{int(time.time() * 1000)}"
    
    generation_tasks[generation_id] = {
        "status": "queued",
        "progress": 0,
        "message": "Generation queued",
        "request": request,
        "created_at": datetime.now().isoformat()
    }
    
    background_tasks.add_task(process_generation, generation_id, request)
    
    return GenerationResponse(
        id=generation_id,
        status="queued",
        created_at=generation_tasks[generation_id]["created_at"]
    )

async def process_generation(generation_id: str, request: GenerationRequest):
    """Background task to process music generation"""
    try:
        # Update status to processing
        generation_tasks[generation_id].update({
            "status": "processing",
            "progress": 10,
            "message": "Initializing neural network..."
        })
        
        await asyncio.sleep(1)
        
        generation_tasks[generation_id].update({
            "progress": 30,
            "message": "Generating musical structure..."
        })
        
        await asyncio.sleep(1)
        
        generation_tasks[generation_id].update({
            "progress": 60,
            "message": "Applying style constraints..."
        })
        
        # Generate music
        music_data = await generator.generate_async(request)
        
        generation_tasks[generation_id].update({
            "progress": 90,
            "message": "Finalizing composition..."
        })
        
        # Save to file
        output_file = f"generated/music_{generation_id}.json"
        with open(output_file, "w") as f:
            json.dump(music_data, f, indent=2)
        
        # Mark as completed
        completed_generations[generation_id] = {
            "id": generation_id,
            "status": "completed",
            "music_data": music_data,
            "midi_url": f"/download/{generation_id}",
            "created_at": generation_tasks[generation_id]["created_at"],
            "duration": len(music_data) * 0.5  # Approximate duration
        }
        
        generation_tasks[generation_id].update({
            "status": "completed",
            "progress": 100,
            "message": "Music generation completed!"
        })
        
        logger.info(f"Generation {generation_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Generation {generation_id} failed: {str(e)}")
        generation_tasks[generation_id].update({
            "status": "failed",
            "progress": 0,
            "message": f"Generation failed: {str(e)}"
        })

@app.get("/status/{generation_id}", response_model=GenerationStatus)
async def get_generation_status(generation_id: str):
    """Get the status of a generation task"""
    if generation_id not in generation_tasks:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    task = generation_tasks[generation_id]
    return GenerationStatus(
        id=generation_id,
        status=task["status"],
        progress=task["progress"],
        message=task["message"]
    )

@app.get("/result/{generation_id}", response_model=GenerationResponse)
async def get_generation_result(generation_id: str):
    """Get the result of a completed generation"""
    if generation_id not in completed_generations:
        if generation_id in generation_tasks:
            task = generation_tasks[generation_id]
            if task["status"] in ["queued", "processing"]:
                raise HTTPException(status_code=202, detail="Generation still in progress")
            else:
                raise HTTPException(status_code=404, detail="Generation failed or not found")
        raise HTTPException(status_code=404, detail="Generation not found")
    
    return GenerationResponse(**completed_generations[generation_id])

@app.get("/download/{generation_id}")
async def download_generation(generation_id: str):
    """Download generated music file"""
    if generation_id not in completed_generations:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    file_path = f"generated/music_{generation_id}.json"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        media_type="application/json",
        filename=f"ai_music_{generation_id}.json"
    )

@app.get("/generations")
async def list_generations():
    """List all generations"""
    all_generations = []
    
    for gen_id, task in generation_tasks.items():
        if gen_id in completed_generations:
            all_generations.append(completed_generations[gen_id])
        else:
            all_generations.append({
                "id": gen_id,
                "status": task["status"],
                "created_at": task["created_at"]
            })
    
    return {"generations": all_generations}

@app.delete("/generation/{generation_id}")
async def delete_generation(generation_id: str):
    """Delete a generation and its files"""
    if generation_id in generation_tasks:
        del generation_tasks[generation_id]
    
    if generation_id in completed_generations:
        del completed_generations[generation_id]
    
    # Delete file
    file_path = f"generated/music_{generation_id}.json"
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return {"message": f"Generation {generation_id} deleted"}

@app.get("/models")
async def list_models():
    """List available models and their capabilities"""
    return {
        "models": [
            {
                "name": "MusicTransformer-v1",
                "type": "transformer",
                "capabilities": ["melody", "harmony", "rhythm"],
                "genres": ["classical", "jazz", "rock", "pop", "electronic"],
                "max_length": 500,
                "loaded": True
            }
        ]
    }

@app.get("/genres")
async def list_genres():
    """List supported music genres"""
    return {
        "genres": [
            {"name": "classical", "description": "Classical and orchestral music"},
            {"name": "jazz", "description": "Jazz and swing music"},
            {"name": "rock", "description": "Rock and alternative music"},
            {"name": "pop", "description": "Pop and contemporary music"},
            {"name": "electronic", "description": "Electronic and synthesized music"}
        ]
    }

# WebSocket for real-time updates
from fastapi import WebSocket, WebSocketDisconnect
from typing import List as TypingList

class ConnectionManager:
    def __init__(self):
        self.active_connections: TypingList[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and send updates
            await asyncio.sleep(1)
            
            # Send status updates for active generations
            for gen_id, task in generation_tasks.items():
                if task["status"] in ["processing"]:
                    await websocket.send_json({
                        "type": "status_update",
                        "generation_id": gen_id,
                        "status": task["status"],
                        "progress": task["progress"],
                        "message": task["message"]
                    })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )