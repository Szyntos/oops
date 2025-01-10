# OOPS - Object Oriented Programming System


<img src="https://github.com/user-attachments/assets/029ac9a3-59de-42c9-b995-e82a5a678544" alt="logo" width="200"/>


## Overview

OOPS (Object-Oriented Programming System) is a gamified web application designed to enhance the learning experience for the "Programowanie Obiektowe" course at AGH University. The application leverages gamification techniques to motivate students, streamline course management for instructors, and provide intuitive tools for coordinators to oversee the course.

This project is based on the foundation laid by [Soamid/obiektowe-lab](https://github.com/Soamid/obiektowe-lab).
## Features

### Student Features
- **Track Progress:** View personal statistics, including points, levels, and rewards.
- **Hall of Fame:** Compare your progress with anonymized rankings of other students.
- **Open Chests:** Earn chests and claim rewards to enhance your course performance.
- **Personalized Profile:** Customize your avatar and nickname.

![student_screen](https://github.com/user-attachments/assets/4f0d8f31-0583-4294-a63f-4c9a3ecb3c87)

### Instructor Features
- **Manage Groups:** Assign points, manage student groups, and track their progress.
- **Award Points and Rewards:** Allocate points for assignments and distribute chests.
- **Monitor Group Statistics:** Access group-level statistics to improve teaching strategies.

<img width="1263" alt="groups_screen" src="https://github.com/user-attachments/assets/cbc117f0-8ad9-4cce-8def-59d06aa71b56" />

### Coordinator Features
- **Course Configuration:** Define grading categories, levels, and conditions for course completion.
- **Manage Participants:** Oversee students, instructors, and group assignments.
- **Advanced Analytics:** Analyze course-wide data and adjust configurations as needed.

<img width="949" alt="chests" src="https://github.com/user-attachments/assets/e9b31b1f-4172-4951-b163-9a3cd5e93bc7" />

### Technology Stack
- **Frontend:** ReactJS with TypeScript
- **Backend:** Kotlin with Spring Boot
- **Database:** PostgreSQL
- **API:** GraphQL
- **Hosting:** Dockerized application hosted on Oracle Cloud
- **Authentication:** Firebase Authentication

### Gamification Mechanics
- **Experience Points (XP):** Earn XP through activities like labs, quizzes, and projects.
- **Levels:** Progress through levels as you earn more XP, directly correlating to your course grade.
- **Rewards and Chests:** Open chests to gain additional XP, multipliers, or other bonuses.
- **Hall of Fame:** Compete in a friendly ranking system with other students.

## How to run

This is a step-by-step guide on how to run OOPS application locally.

### Reqirements

- [Docker desktop](https://www.docker.com/products/docker-desktop/)
- [Intellij Idea with Java 17](https://www.jetbrains.com/idea/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
- [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/)
- [Python](https://www.python.org/)

### Backend

1. Clone this repository with `git clone https://github.com/Szyntos/oops.git`
2. Cd into backend directory `cd oops/backend`
3. Run Docker desktop
4. Run `docker compose --env-file ../.env up -d`.

   Note: If you're on Windows/Linux you should remove `platform: linux/arm64/v8` from `docker-compose.yaml`

5. Open Intellij Idea in backend project folder
6. Setup sdk to use Java 17. (On MacOs click `cmd + ;`)
7. Build a project with gradle, alternatively run `./gradlew build` (`./gradlew.bat build` for Windows)
8. Run `BackendApplication` file, alternatively run `./gradlew bootRun` (`./gradlew.bat bootRun` for Windows)
9. If something doesnt work make sure sdk is correctly set up and all dependencies are downloaded
10. Apply hasura metadata by `cd hasura`, `hasura metadata apply`
11. If there are any updates to backend do git pull, rebuild a project and apply hasura metadata again
12. To access hasura console go to `localhost:9191`. The password is `admin_secret`
13. To populate the database run `cd backend/src/main/python/` and `python insert_data.py`. This script purges the existing data from the database and repopulates the database with random (set seed) data.

### Frontend

1. Cd frontent directory `cd ../frontend`
2. Make sure yarn is installed `npm install --global yarn`
3. Run `yarn`
4. Run `yarn codegen`
5. Run `yarn dev`

## Deployment

To deploy the application, follow the steps below:
1. Install docker and docker-compose on the server.
2. Clone this repository with `git clone https://github.com/Szyntos/oops.git`
3. Cd into repository `cd oops`
4. Run `mkdir backend/resources`
5. Run `nano `.env` and setup environment variables
6. Run `deploy.sh`

## Environment Variables Configuration

The application relies on the following environment variables for configuration. Ensure you define these variables in a `.env` file in the root of the project.

#### Database Configuration
- **POSTGRES_USER**: The username for the PostgreSQL database.
- **POSTGRES_PASSWORD**: The password for the PostgreSQL database.
- **POSTGRES_DB**: The name of the PostgreSQL database.
- **HASURA_GRAPHQL_DATABASE_URL**: The database URL for Hasura in the format `postgres://<user>:<password>@<host>:<port>/<dbname>`.
- **POSTGRES_URL**: JDBC connection URL for the PostgreSQL database (`jdbc:postgresql://host.docker.internal:6543/<dbname>`).

#### Hasura Configuration
- **HASURA_GRAPHQL_ADMIN_SECRET**: The admin secret required for accessing Hasura's GraphQL APIs.
- **HASURA_GRAPHQL_JWT_SECRET**: The JWT secret for authentication in Hasura.

#### Mail Server Settings
- **MAIL_HOST**: The mail server's host (e.g., `smtp.gmail.com` for Gmail).
- **MAIL_PORT**: The mail server's port.
- **MAIL_USERNAME**: The username for the mail server.
- **MAIL_PASSWORD**: The password for the mail server.
- **MAIL_SMTP_AUTH**: Whether SMTP authentication is enabled (`true` or `false`).
- **MAIL_SMTP_AUTH_STARTTLS_ENABLE**: Whether STARTTLS is enabled for the SMTP server.
- **MAIL_FROM**: The email address used for sending emails.

#### Firebase Configuration
- **VITE_FIREBASE_API_KEY**: Firebase API key.
- **VITE_FIREBASE_AUTH_DOMAIN**: Firebase Authentication domain.
- **VITE_FIREBASE_PROJECT_ID**: Firebase project ID.
- **VITE_FIREBASE_STORAGE_BUCKET**: Firebase storage bucket.
- **VITE_FIREBASE_MESSAGING_SENDER_ID**: Firebase messaging sender ID.
- **VITE_FIREBASE_APP_ID**: Firebase app ID.
- **VITE_FIREBASE_MEASUREMENT_ID**: Firebase analytics measurement ID.

#### Application Settings
- **VITE_EMAIL_DOMAIN**: The email domain used in the application as the default student's email domain.
- **VITE_PUBLIC_IP**: The public IP address of the application.
- **BACKEND_GRAPHQL_URL**: The backend GraphQL server URL (e.g., `http://host.docker.internal:9090/graphql`).
- **CORS_ALLOWED_ORIGIN**: The allowed origins for CORS (Cross-Origin Resource Sharing).

#### Firebase Secret
- **FIREBASE_SECRET_JSON_BASE64**: The base64-encoded Firebase secret JSON.

#### Demo Data and Initialization
- **DO_INSERT_DEMO_DATA**: Whether to insert demo data into the database (`true` or `false`).
- **INIT_DATA**: Whether to insert minimal data (`true` or `false`).
- **DO_INSERT_FILES**: Whether to insert initial files into the system (`true` or `false`).
- **ADMIN_MAIL**: The admin email address for logging in to the system.
-
#### Authentication Bypass
- **BYPASS_AUTH**: Whether to bypass authentication for development (`true` or `false`).
- **VITE_BYPASS_TOKEN**: Token prefix used when authentication is bypassed.

## Authors

This project was developed by:

- **Dominik Adamczyk**  
- **Julia Smerdel**  
- **Anna Cichocka**
- **Szymon Nowak-Trzos**
