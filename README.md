# 🧠 Smart Todo AI – README

AI-powered task management that thinks ahead.
Built with Django REST + Next.js + Supabase + OpenAI.

📸 Screenshots
Sign In / Sign Up page:
![alt text](image.png)
Dashboard showing task list with priority:
![alt text](image-1.png)
Task creation/edit form with AI suggestions
![alt text](image-2.png)
![alt text](image-3.png)
Context input screen (messages, emails, notes)
![alt text](image-4.png)

🚀 Features
🔁 Full-stack todo manager with AI integration

🧠 AI Suggestions:

Task prioritization

Deadline recommendations

Context-based task enhancement

Smart categorization (auto tags)

📥 Daily Context Analysis (Emails, Notes, WhatsApp-style input)

🧱 Tech Stack
Tech:
Frontend    Next.js + Tailwind CSS
Backend     Django REST Framework
AI Module   OpenAI / LM Studio (Llama/Mistral)
Database    Supabase (PostgreSQL)
Storage     Supabase Storage

📂 Folder Structure
/project
 ┣ backend/        # Django backend
 ┣ frontend/       # Next.js frontend
 ┃ ┣ app/
 ┃ ┣ components/
 ┃ ┣ hooks/
 ┃ ┣ lib/
 ┃ ┣ ...
 ┣ supabase/       # DB config, migrations
 ┣ README.md

⚙️ Setup Instructions

🛠 Backend Setup (Django)
cd project/backend
python -m venv env
source env/bin/activate  # or env\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

🌐 Frontend Setup (Next.js)
cd project/frontend
npm install
npm run dev

🤖 AI Integration (LM Studio)
This project uses LM Studio to run local LLMs (like LLaMA 2 Chat or Mistral) for:

Task analysis

Priority scoring

Deadline prediction

Smart tagging and enhanced descriptions

LM Studio is configured as a drop-in replacement for OpenAI using this endpoint:
LLM_API_URL=<http://192.168.xx.xx:1234/v1/chat/completions>
✅ Prompt structure follows OpenAI-style messages (role + content)
✅ Supports any chat model like llama-2-7b-chat, mistral-instruct, openchat, etc.

For best results, load the model via LM Studio desktop app and expose the local endpoint.

📡 API Documentation:

GET APIs
Endpoint    Description
/api/tasks    Get all tasks
/api/categories    Get task categories/tags
/api/context    Get all daily context entries

POST APIs
Endpoint    Description
/api/tasks    Create new task
/api/context    Add context entry (email/message)
/api/ai/suggest    Get AI suggestions/prioritization

🧪 Sample Data
Sample context entries in /supabase/sample_context.sql

Sample tasks for testing AI in /backend/smarttodo/tests/fixtures/
✅ Requirements
Include a file named requirements.txt in backend like:
Django==4.2.5
djangorestframework

🧑‍🎓 Author
👨‍💻 Anant Kumar Jha
🆔 B.Tech IT,2026
📍 GGSIPU (Guru Gobind Singh Indraprastha University), Guru Tegh Bahadur Institute Of Technology
📧 [jhasonu136@gmail.com](mailto:jhasonu136@gmail.com)
