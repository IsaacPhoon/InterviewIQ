"""FastAPI main application."""

import logging

from app.api import auth, job_descriptions, responses
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description='AI-powered interview preparation coach',
    debug=settings.debug,
)

# Configure CORS - must be added before other middleware
cors_origins = settings.cors_origins_list
logger.info(f'Configuring CORS with origins: {cors_origins}')

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
    expose_headers=['*'],
)

# Include routers
app.include_router(auth.router)
app.include_router(job_descriptions.router)
app.include_router(responses.router)


@app.get('/')
def root():
    """Root endpoint."""
    return {
        'message': 'InterviewIQ API',
        'version': settings.app_version,
        'docs': '/docs',
    }


@app.get('/health')
def health_check():
    """Health check endpoint."""
    return {'status': 'healthy'}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=8000)
