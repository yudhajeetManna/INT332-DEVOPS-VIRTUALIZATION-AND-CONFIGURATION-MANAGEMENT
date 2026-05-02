# Day 11: GitHub Actions with Docker (Python/Flask)

This practical demonstrates setting up a CI/CD pipeline for a Python Flask application using Docker and GitHub Actions.

## Project Files

### app.py
```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def home():
    return "Hello from Docker CI/CD!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
```

### requirements.txt
```text
Flask
```

### Dockerfile
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```

## GitHub Actions Workflow (.github/workflows/ci-cd.yml)
```yaml
name: CI-CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Build Docker Image
        run: docker build -t my-docker-app .

      - name: List Docker Images
        run: docker images
```

## Running Locally
1. Build the image:
   ```bash
   docker build -t my-docker-app .
   ```
2. Run the container:
   ```bash
   docker run -p 5000:5000 my-docker-app
   ```
3. Open `http://localhost:5000` in your browser.
