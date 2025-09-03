
# SpendWise: A Financial Tracking Application

SpendWise is a full-stack financial tracking application. This project uses a **monorepo structure**, with the front end and back end housed in separate folders. The application is containerized using Docker and Docker Compose, making it easy to set up and run.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

You need to have **Docker** and **Docker Compose** installed on your system.

* **Docker:** Follow the official Docker installation guide for your operating system.
* **Docker Compose:** It's usually included with Docker Desktop. If not, you can install it separately.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [repository-url]
    cd spendwise
    ```

2.  **Start the application:**
    From the root directory of the project, run the following command to build and start all services defined in the `docker-compose.yml` file.

    ```sh
    docker-compose up --build
    ```

    * `--build`: This flag ensures that Docker builds the images for the `server` and `client` services before starting the containers.

## Application Architecture

The application is composed of three main services, all managed by Docker Compose:

* **`db` (Database):** A **MySQL 8.0** database container.
    * **Container Name:** `spendwise_db`
    * **Port:** Mapped to `3306` on the host machine.

* **`server` (Backend API):** A Python-based backend service.
    * **Container Name:** `spendwise_api`
    * **Port:** Mapped to `8000` on the host machine.
    * **Configuration:** Connects to the database using environment variables.

* **`client` (Frontend):** A web-based frontend service.
    * **Container Name:** `spendwise_client`
    * **Port:** Mapped to `5173` on the host machine.
    * **Dependency:** This service depends on the `server` service.
    * **Configuration:** Communicates with the backend API using the `VITE_API_URL` environment variable.

## Accessing the Application

Once all services are up and running, you can access the frontend application in your web browser at:

http://localhost:5173


The backend API will be running at `http://localhost:8000`.

## Stopping the Application

To stop the running containers, press `Ctrl+C` in your terminal. To stop and remove the containers, networks, and volumes, run:

```sh
docker-compose down -v
