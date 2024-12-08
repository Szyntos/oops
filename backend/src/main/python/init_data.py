import psycopg2
import random
import json
from utils.insert_files import insert_files
from utils.insert_initial_user import insert_initial_coordinator

# Load configuration from config.json
with open('config.json', encoding="UTF-8") as config_file:
    config = json.load(config_file)

# Extract values from the configuration
db_config = config['database']
base_url = config['base_url']
hasura_url = config['hasura']['url']
headers = config['hasura']['headers']
data_insertion_config = config['data_insertion']
backend_resources_path = data_insertion_config['backend_resources_path']


def create_connection():
    return psycopg2.connect(
        dbname=db_config['dbname'],
        user=db_config['user'],
        password=db_config['password'],
        host=db_config['host'],
        port=db_config['port']
    )

def insert_data():
    insert_files(base_url + "/files/upload")
    coordinator_id_and_role = insert_initial_coordinator(hasura_url, headers)

    conn.commit()
    cursor.close()
    conn.close()


if __name__ == '__main__':
    conn = create_connection()
    cursor = conn.cursor()

    seed = data_insertion_config['seed']
    random.seed(seed)

    insert_data()
    print("Data inserted successfully.")
