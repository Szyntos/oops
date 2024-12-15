@echo off

REM Step 1: Start Docker services
docker-compose --env-file ../.env up -d

REM Step 2: Build the Spring Boot application in a non-blocking way
start /wait cmd /c "gradlew.bat build"

REM Step 3: Start the Spring Boot application in a new window
start "" cmd /c "gradlew.bat bootRun"

REM Wait for the Spring Boot application to start
echo Waiting for the Spring Boot application to start...

:waitLoop
timeout /t 5 /nobreak >nul

REM Check if the Spring Boot application is running by checking the health endpoint
curl -s http://localhost:9090/actuator/health | findstr /i "\"status\":\"UP\""
if errorlevel 1 (
    echo Spring Boot is not ready yet...
    goto waitLoop
)

echo Spring Boot application is up and running.

REM Step 4: Move to the Hasura directory
cd hasura

REM Step 5: Apply Hasura metadata
hasura metadata apply

REM Step 6: Reload Hasura metadata
hasura metadata reload

REM Step 7: Move to the Python script directory
cd ../src/main/python/

REM Step 8: Run the Python script to insert data
start python insert_data.py
