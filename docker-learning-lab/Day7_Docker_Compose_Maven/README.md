# Day 7: Docker Compose for Maven

This day demonstrates how to use Docker Compose to simplify the Maven build process.

## Docker Compose Configuration

Create a `docker-compose.yml` file:
```yaml
version: "3.9"

services:
  maven-build:
    image: maven:3.9.10-eclipse-temurin-17
    container_name: maven-build
    working_dir: /app
    volumes:
      - .:/app
      - ~/.m2:/root/.m2   
    command: mvn clean install
```

## Running the Build
To start the build process:
```bash
docker compose up --build
```

This setup mounts the current directory to `/app` inside the container and caches the Maven dependencies in the host's `~/.m2` directory to speed up subsequent builds.
