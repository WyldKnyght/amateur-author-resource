# backend/alembic/env.py
import sys
import os

# Ensure current project root is in sys.path, so local imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from logging.config import fileConfig
from alembic import context

# Alembic Config object
config = context.config

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- PURE SQLMODEL CONFIG ---
# Import all models and SQLModel itself
from sqlmodel import SQLModel
from app.models.user import User
from app.models.project import Project
from app.models.story_content import StoryContent


# Tell Alembic to use SQLModel's metadata for autogeneration
target_metadata = SQLModel.metadata

# --- MIGRATION FUNCTIONS ---

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    from sqlalchemy import create_engine
    connectable = create_engine(config.get_main_option("sqlalchemy.url"))

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()

# Entry point for Alembic
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
