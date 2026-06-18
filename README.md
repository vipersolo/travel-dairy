# Travel Diary

A full-stack travel planning platform built using Django REST Framework and React.

## Features

- User Authentication using JWT
- Role-based access control
- Destination browsing
- Tour package booking
- Accommodation management
- Reviews and ratings
- Destination recommendation system
- Stripe integration
- Cloudinary
- Dockerized production deployment
- Automated refunds
- Nginx

## Tech Stack

### Frontend
- React
- Redux Toolkit
- Bootstrap
- Axios

### Backend
- Django
- Django REST Framework
- SimpleJWT

### Database
- PostgreSQL

## Live Demo

Frontend: https://asset-management-frontend-react.onrender.com
Backend API: https://asset-mangement-system-react-django.onrender.com

## Screenshots

(Add screenshots)

## Installation

Backend
cd travel_diary_backend

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
Frontend
cd travel_diary_frontend

npm install
npm run dev

## Future Improvements

- Email notifications
- Advanced recommendation engine
