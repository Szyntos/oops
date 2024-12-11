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
    "x-hasura-admin-secret": os.getenv("HASURA_GRAPHQL_ADMIN_SECRET"),
}
admin_mail = os.getenv("ADMIN_MAIL")
do_insert_files = os.getenv("DO_INSERT_FILES", "true").lower() == "true"

def insert_data():
    if do_insert_files:
        insert_init_files(base_url + "/files/upload")
    coordinator_id_and_role = insert_initial_coordinator(hasura_url, headers)

if __name__ == '__main__':
    insert_data()
    print("Data inserted successfully.")
