# Technology Stack Overview

## Local Environment
| Layer    | Technology                 | Setup Approach                    | License/Cost |
|----------|----------------------------|-----------------------------------|--------------|
| Frontend | React 18 + TypeScript      | Local node/npm via Vite           | MIT / Free   |
| Backend  | FastAPI                    | Python via venv                   | MIT / Free   |
| Database | SQLite                     | File-based, included in Python    | Public Domain|
| ORM      | SQLModel                   | Python package                    | MIT / Free   |
| Testing  | Pytest (Python), Jest (JS) | Locally installed                 | MIT / Free   |
| Docs     | MkDocs/Docusaurus          | Static docs directory             | MIT / Free   |

***

## Stack Summary

- **Frontend**: React 18 + TypeScript, with Vite for fast builds, and Chakra UI or MUI for quick accessible UI.
- **Backend**: FastAPI (Python), SQLModel for models/database.
- **Database**: SQLite, ensures file portability and zero setup; ready to swap for PostgreSQL/MySQL if scaling is needed.
- **ORM**: SQL Model
- **Testing**: Pytest (Python), Jest (JavaScript/TypeScript).
- **Documentation**: MkDocs or Docusaurus—free, open-source, and easy for contributors.
