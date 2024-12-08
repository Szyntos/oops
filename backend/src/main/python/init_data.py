import json
import os
from utils.insert_init_files import insert_init_files
from utils.insert_initial_user import insert_initial_coordinator

# Load configuration from config.json
with open('config_init.json', encoding="UTF-8") as config_file:
    config = json.load(config_file)

# Extract values from the configuration
base_url = "http://backend:9090"
hasura_url = "http://hasura:8080/v1/graphql"
headers = {
    "Content-Type": "application/json",
    "x-hasura-role": "admin",
    "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET"),
}

def insert_data():
    insert_init_files(base_url + "/files/upload")
    coordinator_id_and_role = insert_initial_coordinator(hasura_url, headers)

if __name__ == '__main__':
    insert_data()
    print("Data inserted successfully.")
