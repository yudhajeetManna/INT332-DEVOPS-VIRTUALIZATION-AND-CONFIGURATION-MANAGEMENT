# Day 9: CI/CD with GitHub Actions

This day covers setting up a CI/CD pipeline using GitHub Actions to automate the building of Docker images.

## CI/CD Pipeline Configuration
Create `.github/workflows/ci-cd.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Set up Java
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Build Project
      run: mvn clean install

    - name: Build Docker Image
      run: docker build -t my-app .

    - name: Run Container (Test)
      run: docker run -d -p 8080:8080 my-app
```

## Multi-stage Dockerfile
Using multi-stage builds to keep the final image small:
```dockerfile
FROM maven:3.9.10-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```
