# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . /app
RUN mvn clean package -DskipTests

# Package stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/payroll-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"] # <--- CHANGE THIS LINE: REMOVE THE LEADING SLASH
EXPOSE 8080
# Or whatever port your Spring Boot app listens on (e.g., from application.properties)