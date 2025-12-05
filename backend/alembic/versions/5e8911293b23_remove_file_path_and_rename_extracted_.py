"""Remove file_path and rename extracted_text to description_text

Revision ID: 5e8911293b23
Revises: f77d385450cc
Create Date: 2025-12-04 02:59:59.674960

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e8911293b23'
down_revision: Union[str, Sequence[str], None] = 'f77d385450cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename extracted_text to description_text (preserves data)
    op.alter_column('job_descriptions', 'extracted_text',
                    new_column_name='description_text')

    # Drop file_path column
    op.drop_column('job_descriptions', 'file_path')


def downgrade() -> None:
    """Downgrade schema."""
    # Add file_path column back
    op.add_column('job_descriptions',
                  sa.Column('file_path', sa.VARCHAR(), autoincrement=False, nullable=True))

    # Rename description_text back to extracted_text (preserves data)
    op.alter_column('job_descriptions', 'description_text',
                    new_column_name='extracted_text')
