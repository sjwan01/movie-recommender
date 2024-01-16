# Use the official Python 3.10 slim image
FROM python:3.10-slim-bullseye

# Set the working directory to /app
WORKDIR /app

# Install Java and procps
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk procps

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip==23.3.1 && pip install -r requirements.txt

# Copy the entire app directory into the container at /app
COPY app/ .

# Expose port 4000
EXPOSE 4000

# Command to run the application
CMD ["python3", "app.py"]