# KnowledgeAI — Knowledgebase & AI Insights Platform

KnowledgeAI is a locally running document knowledgebase that extracts text from uploaded files, supports document search and question answering, and generates AI-powered summaries and key points using a local Ollama model.

## Features

- Upload and process PDF, DOCX, CSV, HTML, and TXT files.
- Extract document text and store document metadata in SQLite.
- Search across uploaded documents.
- Ask questions about the knowledgebase and view source documents.
- Generate and save AI-powered document summaries and key points.
- Delete documents and their associated insights.
- Run the frontend and backend using Docker Compose.
- Use a local AI model instead of a paid AI API.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, CSS
- **Backend:** Python, FastAPI
- **Database:** SQLite
- **AI:** Ollama with the `llama3.2:1b` model
- **Deployment:** Docker and Docker Compose

## Prerequisites

Install the following before starting the application:

- Docker Desktop
- Ollama installed on the host machine
- The `llama3.2:1b` model downloaded through Ollama

Download the model if necessary:

```powershell
ollama pull llama3.2:1b
```

Ensure Ollama is running and the model is available before testing AI features.

## Run with Docker

Open PowerShell in the project root directory.

Build and start the application:

```powershell
docker compose up --build -d
```

Check container status:

```powershell
docker compose ps
```

Open the application:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API documentation:** http://localhost:8000/docs

View application logs:

```powershell
docker compose logs -f
```

View backend logs only:

```powershell
docker compose logs -f backend
```

Restart the containers:

```powershell
docker compose restart
```

Rebuild after changing application code:

```powershell
docker compose up --build -d
```

Stop the containers:

```powershell
docker compose down
```

Stopping the containers does not normally remove the project files or bind-mounted database and uploads. Avoid deleting the database or upload folders if you want to preserve your local data.

## Supported File Formats

| Format | Extension |
|---|---|
| PDF | `.pdf` |
| Microsoft Word | `.docx` |
| Comma-separated values | `.csv` |
| HTML | `.html`, `.htm` |
| Plain text | `.txt` |

Text extraction and AI results depend on the content that can be extracted from each file.

## API Endpoints

The backend provides the following main endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend health |
| GET | `/api/dashboard` | Retrieve dashboard statistics |
| GET | `/api/documents` | List uploaded documents |
| POST | `/api/documents` | Upload a document |
| DELETE | `/api/documents/{document_id}` | Delete a document and its associated insights |
| GET | `/api/search` | Search indexed document content |
| POST | `/api/ask` | Ask a question about the knowledgebase |
| POST | `/api/insights/{document_id}` | Generate document insights |
| GET | `/api/insights` | Retrieve saved insights |

Interactive API testing is available at http://localhost:8000/docs.

## Local AI Configuration

KnowledgeAI uses Ollama with the local `llama3.2:1b` model for question answering and document insight generation.

When running with Docker Compose, the backend uses the `OLLAMA_URL` environment variable to connect to Ollama on the host machine:

`http://host.docker.internal:11434/api/generate`

The backend code defaults to `http://127.0.0.1:11434/api/generate` when `OLLAMA_URL` is not set, and adapts the loopback address for Docker access.

Ensure Ollama is running and the `llama3.2:1b` model is downloaded before using AI features.

KnowledgeAI's local-model workflow does not require a paid hosted AI API.

## Data Storage and Privacy

- Document metadata, extracted text, and saved insights are stored in SQLite.
- Uploaded files are stored in the backend uploads directory.
- Docker Compose mounts the database and uploads directory so data can persist across container restarts.
- Review `.gitignore` and `.dockerignore` before publishing the project.
- Do not commit private documents, local databases, credentials, or environment files to a public repository.

## Testing Checklist

After starting the containers, verify the following:

- [ ] Both frontend and backend containers are running.
- [ ] The dashboard loads and displays document statistics.
- [ ] PDF, DOCX, CSV, HTML, and TXT uploads work.
- [ ] Document search returns relevant results.
- [ ] AI Assistant answers questions and lists source documents.
- [ ] Insights can be generated and viewed.
- [ ] Deleting a document also removes its associated saved insights.
- [ ] Documents and insights remain available after restarting the containers.

## Current Limitations

- Answers depend on the text extracted from uploaded documents.
- AI-generated answers and summaries may be inaccurate; verify important information against the original documents.
- Scanned PDFs may require OCR support, which is not guaranteed by the current implementation.
- AI features require Ollama and the configured local model to be available.
- The local model may produce incomplete or irrelevant answers, especially when document content is limited.

## License

No license has been selected yet. Add an appropriate license before distributing the project publicly.