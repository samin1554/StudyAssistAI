
FROM openjdk:17-jdk-slim


WORKDIR /app


COPY target/UserService-0.0.1-SNAPSHOT.jar app.jar


EXPOSE 8081

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
