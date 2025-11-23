"""make_file_path_optional_and_extracted_text_required

Revision ID: 3513bdaa0db0
Revises: 
Create Date: 2025-11-22 17:06:55.119062

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3513bdaa0db0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make file_path nullable (optional)
    op.alter_column('job_descriptions', 'file_path',
                    existing_type=sa.String(),
                    nullable=True)
    
    # Make extracted_text non-nullable (required)
    # First, update any NULL values to empty string
    op.execute("UPDATE job_descriptions SET extracted_text = '' WHERE extracted_text IS NULL")
    
    # Then make the column non-nullable
    op.alter_column('job_descriptions', 'extracted_text',
                    existing_type=sa.Text(),
                    nullable=False)


def downgrade() -> None:
    # Revert extracted_text to nullable
    op.alter_column('job_descriptions', 'extracted_text',
                    existing_type=sa.Text(),
                    nullable=True)
    
    # Revert file_path to non-nullable
    # First, update any NULL values to empty string
    op.execute("UPDATE job_descriptions SET file_path = '' WHERE file_path IS NULL")
    
    # Then make the column non-nullable
    op.alter_column('job_descriptions', 'file_path',
                    existing_type=sa.String(),
                    nullable=False)
