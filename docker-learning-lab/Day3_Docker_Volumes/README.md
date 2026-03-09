# Day 3 – Docker Volumes

Goal:
Understand persistent storage in Docker.

Use Case:
Containers are temporary. If a container is deleted,
data inside it will be lost. Docker volumes allow
data to persist even after the container is removed.

Commands

Create volume
docker volume create mydata

List volumes
docker volume ls

Inspect volume
docker volume inspect mydata

Run container with volume
docker run -dit --name mycontainer -v mydata:/app/data ubuntu

Check volume directory
docker exec -it mycontainer ls /app/data

Inspect container
docker inspect mycontainer

Remove container
docker rm -f mycontainer

Remove volume
docker volume rm mydata

Remove unused volumes
docker volume prune
