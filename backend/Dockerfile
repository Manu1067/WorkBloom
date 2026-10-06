# syntax=docker/dockerfile:1
# Build context is the PROJECT ROOT (so database/seed can be copied in):
#   docker build -f backend/Dockerfile .

# ---------- build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Cache dependencies separately from source for fast rebuilds
COPY backend/pom.xml .
RUN mvn -B -q dependency:go-offline

COPY backend/src ./src
# Tests are skipped here (WorkbloomBackendApplicationTests needs a live database);
# run them separately: cd backend && mvn test
RUN mvn -B -q -DskipTests package \
 && mv "$(ls target/*.jar | grep -v -- '-plain' | head -n 1)" /build/app.jar

# ---------- runtime ----------
FROM eclipse-temurin:21-jre
RUN groupadd --system app && useradd --system --gid app --home /app app
WORKDIR /app

COPY --from=build /build/app.jar app.jar
# Travel questionnaire/destination seed SQL, applied by TravelSeedInitializer
# into EMPTY tables only (see TRAVEL_SEED_DIR in docker-compose.yml)
COPY database/seed ./database/seed

# Upload directory is a volume (Impact activity images)
RUN mkdir -p /app/uploads && chown -R app:app /app
USER app

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
