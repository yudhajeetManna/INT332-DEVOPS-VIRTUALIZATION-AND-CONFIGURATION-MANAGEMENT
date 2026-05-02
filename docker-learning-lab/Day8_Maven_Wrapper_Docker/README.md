# Day 8: Maven Wrapper & Docker Integration

This day focuses on using the Maven Wrapper (`mvnw`) and integrating Docker builds directly into the Maven lifecycle using plugins.

## Maven Wrapper
The Maven Wrapper ensures that everyone working on the project uses the same Maven version.

Generate the wrapper:
```bash
mvn -N io.takari:maven:wrapper
```

Run build using wrapper:
```bash
./mvnw clean package
```

## Dockerfile Integration
A simple `Dockerfile` to package the JAR:
```dockerfile
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY target/docker-maven-demo-1.0-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
```

## Maven Configuration (pom.xml)
Using the `dockerfile-maven-plugin` to automate image creation:
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
