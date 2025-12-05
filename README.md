# InterviewIQ

> Your AI-powered behavioral interview coach

InterviewIQ helps job seekers practice behavioral interviews by generating tailored questions, transcribing spoken responses, and providing detailed AI-powered feedback to improve interview performance.

<!-- TODO: Add demo GIF or screenshot here -->

## Why InterviewIQ?

Behavioral interviews are critical for landing your dream job, but practicing them effectively is challenging. You need realistic questions tailored to your target role, the ability to practice speaking your answers aloud, and actionable feedback on your performance. InterviewIQ solves all three problems:

- **Tailored Questions**: Upload a job description and get 5 STAR-method behavioral questions specifically designed for that role
- **Real Practice**: Record your spoken responses using your microphone, just like a real interview
- **AI Feedback**: Get detailed scores and feedback across 5 key criteria: Confidence, Clarity/Structure, Technical Depth, Communication Skills, and Relevance

## Key Features

- **Smart Question Generation**: Claude AI analyzes job descriptions and generates relevant behavioral interview questions
- **Voice Recording**: Browser-based audio recording with playback capability
- **Automatic Transcription**: Powered by faster-whisper for accurate speech-to-text conversion
- **Comprehensive Evaluation**: AI scoring across multiple dimensions with actionable feedback
- **Progress Tracking**: Monitor your improvement across multiple attempts
- **Response History**: Review past attempts and compare your performance over time
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Cloud Storage**: Audio files stored securely on Cloudflare R2

## Tech Stack

### Frontend

- **Framework**: Next.js 16 with App Router (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **State Management**: TanStack React Query + React Context
- **HTTP Client**: Axios

### Backend

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with bcrypt
- **AI Services**:
  - Anthropic Claude API (question generation & evaluation)
  - faster-whisper (audio transcription)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Migrations**: Alembic

## Getting Started

Ready to run InterviewIQ locally? Check out the [QUICKSTART.md](./QUICKSTART.md) guide for detailed setup instructions.

**Quick Overview:**

1. Clone the repository
2. Set up PostgreSQL database
3. Configure environment variables for backend and frontend
4. Install dependencies and run migrations
5. Start backend and frontend servers

## Project Structure

```text
interviewiq/
├── backend/                              # FastAPI backend
│   ├── app/
│   │   ├── api/                          # API route handlers
│   │   │   ├── auth.py                   # Authentication endpoints
│   │   │   ├── job_descriptions.py       # Job & question endpoints
│   │   │   └── responses.py              # Response submission & evaluation
│   │   ├── core/                         # Core configuration
│   │   │   ├── config.py                 # Environment settings
│   │   │   ├── database.py               # Database setup
│   │   │   └── security.py               # JWT & password utilities
│   │   ├── models/                       # SQLAlchemy database models
│   │   ├── schemas/                      # Pydantic request/response schemas
│   │   └── services/                     # Business logic
│   │       ├── claude_service.py         # Claude API integration
│   │       ├── whisper_service.py        # Audio transcription service
│   │       └── r2_storage_service.py     # File storage
│   ├── alembic/                          # Database migrations
│   └── requirements.txt                  # Python dependencies
│
├── frontend/                             # Next.js frontend
│   ├── src/
│   │   ├── app/                          # Next.js App Router pages
│   │   │   ├── login/                    # Login page
│   │   │   ├── register/                 # Registration page
│   │   │   ├── dashboard/                # Job descriptions list
│   │   │   ├── upload/                   # Upload job description
│   │   │   └── practice/                 # Interview practice interface
│   │   ├── components/                   # Reusable UI components
│   │   ├── context/                      # React Context
│   │   ├── hooks/                        # Custom hooks
│   │   ├── services/                     # API client
│   │   └── types/                        # TypeScript definitions
│   └── package.json                      # Node dependencies
│
└── docker-compose.yml                    # PostgreSQL setup for local dev
```

## Data Flow

1. User uploads job description with company name and role
2. Backend calls Claude API to generate 5 behavioral questions
3. User navigates to practice page and records audio response
4. Audio is uploaded and transcribed using faster-whisper
5. Transcript and job context sent to Claude for evaluation
6. User receives scores (1-10) across 5 criteria with specific feedback
7. All data persists to PostgreSQL, audio files to R2 storage

## Evaluation Criteria

Responses are scored on a 1-10 scale across:

- **Confidence**: Tone, pacing, and self-assurance
- **Clarity/Structure**: Organization and coherence (STAR method)
- **Technical Depth**: Specific details and expertise demonstrated
- **Communication Skills**: Articulation and professional language
- **Relevance**: Alignment with the question and role requirements

## Contributing

Contributions are welcome! If you'd like to improve InterviewIQ:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

**Need help getting started?** Check out [QUICKSTART.md](./QUICKSTART.md) for step-by-step setup instructions.
