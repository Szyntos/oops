import random
import json
from utils.insert_init_files import insert_init_files
from utils.insert_initial_user import insert_initial_coordinator

# Load configuration from config.json
with open('config_init.json', encoding="UTF-8") as config_file:
    config = json.load(config_file)

# Extract values from the configuration
base_url = config['base_url']
hasura_url = config['hasura']['url']
headers = config['hasura']['headers']
data_insertion_config = config['data_insertion']

def insert_data():
    insert_init_files(base_url + "/files/upload")
    coordinator_id_and_role = insert_initial_coordinator(hasura_url, headers)

if __name__ == '__main__':

    seed = data_insertion_config['seed']
    random.seed(seed)

    insert_data()
    print("Data inserted successfully.")
