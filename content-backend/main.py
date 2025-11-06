from fastapi import FastAPI
import os

app = FastAPI(title="Content API")

@app.get("/")
def root():
    return {"message": "Content API Running"}

@app.get("/health")
def health():
    # DB 연결은 나중에 추가
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
