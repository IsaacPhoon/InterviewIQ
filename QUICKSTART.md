# QuickStart Guide - InterviewIQ

This guide will help you get InterviewIQ running locally on your machine in under 10 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/downloads))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/)) **OR** **Docker** ([Download](https://www.docker.com/products/docker-desktop/))

You'll also need:

- An **Anthropic API key** ([Get one here](https://console.anthropic.com/))
- A **Cloudflare R2 account** for audio storage ([Sign up](https://developers.cloudflare.com/r2/))

## Step 1: Clone the Repository

```bash
git clone https://github.com/IsaacPhoon/InterviewIQ.git
cd InterviewIQ
```

## Step 2: Database Setup

### Option A: Using Docker (Recommended)

If you have Docker installed, use the provided docker-compose file:

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with:

- Database: `interview_prep`
- User: `postgres`
- Password: `postgres`

### Option B: Manual PostgreSQL Setup

1. Create a new PostgreSQL database:

```bash
createdb interview_prep
```

1. Note your database connection details for the next step.

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Configure Environment Variables

Copy the example environment file and configure it:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Now edit the `.env` file and update the following values:

- `DATABASE_URL` - Use `postgresql://postgres:postgres@localhost:5432/interview_prep` if using Docker
- `JWT_SECRET` - Generate a secure random string (e.g., `openssl rand -hex 32`)
- `CLAUDE_API_KEY` - Your Anthropic API key from <https://console.anthropic.com/>
- `R2_ENDPOINT_URL` - Your Cloudflare account endpoint (format: `https://<account-id>.r2.cloudflarestorage.com`)
- `R2_ACCESS_KEY_ID` - Your R2 access key
- `R2_SECRET_ACCESS_KEY` - Your R2 secret key
- `R2_BUCKET_NAME` - Your R2 bucket name

**Important Notes:**

- **R2 credentials are required** - the app uses Cloudflare R2 for all audio storage. Set up a free R2 account if you don't have one
- You can leave `R2_PUBLIC_URL` empty to use presigned URLs
- Set `DEBUG=True` for local development

### 3.5 Run Database Migrations

```bash
alembic upgrade head
```

### 3.6 Start the Backend Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload
```

The backend API will be available at: **<http://localhost:8000>**

You can view the interactive API docs at: **<http://localhost:8000/docs>**

## Step 4: Frontend Setup

Open a **new terminal window** and navigate to the frontend directory:

### 4.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4.4 Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at: **<http://localhost:3000>**

## Step 5: Test Your Setup

1. Open your browser and navigate to **<http://localhost:3000>**
2. You should see the InterviewIQ login page with an animated intro
3. Click "Create an account" and register with an email and password
4. After registration, you'll be redirected to the dashboard

### Quick Test Flow

1. **Upload a Job Description**:
   - Click "Upload New Job Description"
   - Enter company name (e.g., "Google")
   - Enter job title (e.g., "Software Engineer")
   - Paste a job description or write a brief one
   - Click "Generate Questions"
   - Wait for 5 questions to be generated (takes ~10 seconds)

2. **Practice an Interview**:
   - From the dashboard, click "Start Practice"
   - Read the first question
   - Click the microphone icon to start recording
   - Speak your answer (try to use the STAR method)
   - Click the microphone again to stop recording
   - Click "Submit Response"
   - Wait for transcription and evaluation (~15-30 seconds)
   - Review your scores and feedback

## Common Issues & Troubleshooting

### Backend Won't Start

**Problem**: `ModuleNotFoundError: No module named 'app'`

- **Solution**: Make sure you're in the `backend` directory and your virtual environment is activated

**Problem**: `sqlalchemy.exc.OperationalError: could not connect to server`

- **Solution**: Ensure PostgreSQL is running and the `DATABASE_URL` in `.env` is correct

**Problem**: `anthropic.APIConnectionError`

- **Solution**: Check that your `CLAUDE_API_KEY` is valid and you have API credits

### Frontend Won't Start

**Problem**: `Error: Cannot find module 'next'`

- **Solution**: Run `npm install` again in the `frontend` directory

**Problem**: API calls failing with CORS errors

- **Solution**: Ensure your frontend URL is listed in the backend's `CORS_ORIGINS` setting

### Audio Recording Issues

**Problem**: "Microphone permission denied"

- **Solution**: Grant microphone access when prompted by your browser. Check browser settings if needed.

**Problem**: Recording fails to start

- **Solution**: Ensure you're using HTTPS (or localhost). Some browsers require secure context for MediaRecorder API.

### Database Migration Issues

**Problem**: `alembic.util.exc.CommandError: Can't locate revision`

- **Solution**: Delete the `alembic/versions` directory and run migrations again, or reset your database

### Whisper Model Download

**First time running transcription may be slow** - faster-whisper downloads the model (~150MB for base.en) on first use. Subsequent transcriptions will be much faster.

## Next Steps

Now that InterviewIQ is running:

1. **Explore the Features**: Try uploading different job descriptions and see how the questions change
2. **Practice Multiple Times**: Record different answers to the same question and compare your scores
3. **Review Feedback**: Pay attention to the specific feedback in each category to improve your responses
4. **Check the History**: View your past attempts to track your progress over time

## Development Tips

### Database Reset

If you need to reset your database:

```bash
cd backend
alembic downgrade base
alembic upgrade head
```

### View Database

To inspect your database directly:

```bash
# Using psql
psql interview_prep

# Or use a GUI tool like pgAdmin or DBeaver
```

### Hot Reload

Both backend and frontend support hot reload:

- **Backend**: Automatically reloads when you save Python files (if using `--reload` flag)
- **Frontend**: Next.js dev server automatically reloads on file changes

## Getting Help

- **API Documentation**: Visit <http://localhost:8000/docs> when backend is running
- **Issues**: Check existing issues or create a new one on GitHub
- **Main README**: See [README.md](./README.md) for architecture and feature details

---

**You're all set!** Start practicing your behavioral interviews with InterviewIQ.
