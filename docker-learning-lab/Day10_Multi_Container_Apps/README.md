# Day 10: Multi-Container Apps (WordPress + MySQL)

This day explores orchestrating multiple containers using Docker Compose to set up a full WordPress site with a MySQL database.

## Docker Compose Configuration
```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    container_name: wordpress-app
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wpuser
      WORDPRESS_DB_PASSWORD: wppass
      WORDPRESS_DB_NAME: wpdb
    depends_on:
      - db

  db:
    image: mysql:5.7
    container_name: mysql-db
    restart: always
    environment:
      MYSQL_DATABASE: wpdb
      MYSQL_USER: wpuser
      MYSQL_PASSWORD: wppass
      MYSQL_ROOT_PASSWORD: rootpass
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

## How to Run
1. Start the containers:
   ```bash
   docker compose up -d
   ```
2. Access WordPress at `http://localhost:8080`.
3. The database data is persisted using a Docker volume named `db-data`.
