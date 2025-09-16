# Amateur Author Resource Platform

## Welcome

The Amateur Author Resource Platform is a free, open-source toolkit for fiction writers of all experience levels. 

It supports your creative process—from brainstorming and outlining to writing and tracking progress—using privacy-first, incremental features designed for ease of use and local control.

## Key Features

- **Character Builder:** Design and manage all your story’s characters.
- **Plot Outliner:** Organize plots, chapters, and timelines visually.
- **Manuscript Editor:** Write, format, and track your work with auto-save and version history.
- **Progress Tracker:** Monitor word counts and set personal writing goals.
- **Privacy:** All story data remains private, stored locally on your device.
- **Simple Setup:** No coding required—just follow the Quick Start and begin writing.

## Quick Start

1. **Clone & Install**
    ```
    git clone https://github.com/wyldknyght/amateur-author-resource.git
    cd amateur-author-resource
    python -m venv .venv
    pip install -r requirements.txt
    cd frontend
    npm install
    ```
2. **Run the App**
    - In the project root, double-click or run:
        - Windows: `run_local_windows.ps1`
    - Or manually from terminal:
        ```
        cd backend
        uvicorn app.main:app --reload
        # Open a new terminal window
        cd frontend
        npm run dev
        ```
    - Visit: Backend at http://127.0.0.1:8000/docs and Frontend at http://localhost:5173



## How To Use

- **Sign Up/Login:** Register to keep your stories private.
- **Create Projects:** Start organizing characters, plots, and scenes in a new project.
- **Write & Edit:** Use the manuscript editor for drafting and revision—your work auto-saves and keeps versions.
- **Track Progress:** View your word count and goal milestones.
- **Export:** Download your manuscript in popular file formats.

## FAQ

| Question                       | Answer                                                            |
|--------------------------------|-------------------------------------------------------------------|
| Do I need to code to use this?  | No, everything works out of the box for writers—just follow Quick Start.|
| Is my data private?             | Yes, your work is stored locally and accessible only to you.      |
| How does the app update?        | New tools and improvements are added over time to match the writing process.|
| Can I collaborate?              | Collaboration isn’t available now; platform is tuned for solo writers.     |

## Support & Feedback

- If you encounter problems or have suggestions, use the GitHub Issues feature or Discussion section.
- Feedback is always welcome to improve usability for fiction writers.

## About

This project is designed for individual writers. 

All documentation here is for users, and no developer documents or contribution guides are publicly shared.
