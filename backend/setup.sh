#!/bin/bash

# Step 1: Start Docker services
docker-compose --env-file ../.env up -d

# Step 2: Build the Spring Boot application in a separate terminal and wait for it to finish
osascript <<EOF
tell application "Terminal"
    do script "cd '$(pwd)' && ./gradlew build; exit"
    repeat while (do shell script "pgrep -f gradlew" as string) is not equal to ""
        delay 1
    end repeat
end tell
EOF

# Step 3: Start the Spring Boot application in a new terminal window after the build is complete
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && ./gradlew bootRun"'

# Wait for the Spring Boot application to start
echo "Waiting for the Spring Boot application to start..."

while true; do
  # Check if the Spring Boot application is running by checking the health endpoint
  status=$(curl -s http://localhost:9090/actuator/health | grep -i "\"status\":\"UP\"")
  
  if [ ! -z "$status" ]; then
    echo "Spring Boot application is up and running."
    break
  else
    echo "Spring Boot is not ready yet..."
    sleep 5
  fi
done

# Step 4: Move to the Hasura directory
cd hasura

# Step 5: Apply Hasura metadata
hasura metadata apply

# Step 6: Reload Hasura metadata
hasura metadata reload

# Step 7: Move to the Python script directory
cd ../src/main/python/

# Step 8: Run the Python script to insert data
python3 insert_data.py
