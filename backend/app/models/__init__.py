from sqlmodel import SQLModel

# This file is for structure only, no Base required
# You may include any shared utilities, but not SQLAlchemy's Base.
# All models should inherit from SQLModel with `table=True`

# SQLModel collects all models (with table=True) into SQLModel.metadata
# For Alembic migrations, always use SQLModel.metadata
