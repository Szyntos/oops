# Step 1: Use a base image for the build
FROM openjdk:17-jdk-slim as builder

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy Gradle wrapper and necessary files
COPY gradlew .
COPY gradlew.bat .
COPY gradle ./gradle

# Step 4: Ensure gradlew has LF line endings and correct permissions
RUN apt-get update && apt-get install -y dos2unix && dos2unix gradlew
RUN chmod +x gradlew

# Step 5: Copy Kotlin Gradle build scripts and source files
COPY build.gradle.kts settings.gradle.kts ./
COPY src src
COPY resources resources

# Step 6: Build the project
RUN ./gradlew build -x test --no-daemon

# Step 7: Use a minimal runtime image
FROM openjdk:17-jdk-slim

# Step 8: Set working directory and copy the JAR
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

# Step 9: Expose application port
EXPOSE 9090

# Step 10: Run the application
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
