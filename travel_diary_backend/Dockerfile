# Use official Python runtime as a parent image
FROM python:3.11-slim

# Prevent .pyc files and enable immediate console logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# TEMP database for build stage only
ENV DATABASE_URL=sqlite:///db.sqlite3

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Copy the startup script into the container
COPY start.sh /app/

# Grant execution permissions to the script
RUN chmod +x /app/start.sh

# Tell Docker to run the script when the container boots
CMD ["/app/start.sh"]