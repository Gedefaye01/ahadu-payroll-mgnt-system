# Use Maven image to build the project
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the entire project
COPY . .

# Build only the backend project
RUN ./mvnw clean package -DskipTests -pl backend-springboot -am

# Use JDK image to run the JAR
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy the built JAR file from the previous step
COPY --from=build /app/backend-springboot/target/*.jar app.jar

# Expose the port your app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
