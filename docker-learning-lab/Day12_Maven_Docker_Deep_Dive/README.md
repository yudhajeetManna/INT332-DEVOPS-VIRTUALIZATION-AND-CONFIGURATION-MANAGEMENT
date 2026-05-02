# Day 12: Maven & Docker Integration Deep Dive

This practical covers the integration of Maven with Docker using the `dockerfile-maven-plugin` and addresses common configuration issues.

## Project Setup

### 1. Create Maven Project
```bash
mvn archetype:generate \
-DgroupId=com.example \
-DartifactId=docker-demo \
-DarchetypeArtifactId=maven-archetype-quickstart \
-DinteractiveMode=false
```

### 2. Java Code (App.java)
```java
package com.example;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello from Docker + Maven Integration!");
    }
}
```

### 3. Dockerfile
```dockerfile
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY target/docker-maven-demo-1.0-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
```

## Maven Configuration (pom.xml)

Ensure the compiler versions match your environment:
```xml
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
</properties>
```

Add the Docker plugin:
```xml
<plugin>
    <groupId>com.spotify</groupId>
    <artifactId>dockerfile-maven-plugin</artifactId>
    <version>1.4.13</version>
    <configuration>
        <repository>docker-maven-demo</repository>
        <tag>${project.version}</tag>
    </configuration>
</plugin>
```

## Build & Run
1. Build the JAR: `mvn clean package`
2. Build the Docker Image: `mvn dockerfile:build`
3. Verify Image: `docker images`
4. Run Container: `docker run docker-maven-demo:1.0-SNAPSHOT`

## ⚠️ Important Fix: Common Error
If you encounter connection issues with the Docker daemon, enable the TCP port:
1. Open **Docker Desktop**
2. Go to **Settings → General**
3. Enable **Expose daemon on tcp://localhost:2375 without TLS**
4. Restart Docker and try `mvn dockerfile:build` again.
