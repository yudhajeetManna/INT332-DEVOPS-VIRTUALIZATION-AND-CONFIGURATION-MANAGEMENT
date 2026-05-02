# Day 6: Maven with Docker (Basic)

This day focuses on creating and building a Maven project using Docker without having Maven installed locally.

## Steps

### 1. Create a Maven Project
Use the Maven image to generate a new project structure:
```bash
docker run -it --rm -v ${PWD}:/app -w /app maven:3.9.10-eclipse-temurin-17 mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

### 2. Project Structure
Navigate into the project:
```bash
cd my-app
```

### 3. Clean and Build the Project
Clean the project:
```bash
docker run --rm -v ${PWD}:/app -w /app maven:3.9.10-eclipse-temurin-17 mvn clean
```

Build the project (generate JAR):
```bash
docker run --rm -v ${PWD}:/app -w /app maven:3.9.10-eclipse-temurin-17 mvn clean package
```

### 4. Run the Application
Run the generated JAR using a JDK image:
```bash
docker run --rm -v ${PWD}:/app -w /app eclipse-temurin:17-jdk java -cp target/my-app-1.0-SNAPSHOT.jar com.example.App
```

## Sample Java Code (App.java)
```java
package com.example;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello from Docker + Maven");
    }
}
```
