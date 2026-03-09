# Day 2 – Container Interaction

Goal:
Learn how to interact with running containers and transfer files
between host and container.

Use Case:
A DevOps engineer needs to access a container to debug issues,
create files, and copy logs to the host system.

Commands

Run container
docker run -dit --name mycontainer ubuntu

Open terminal inside container
docker exec -it mycontainer /bin/bash

Create directory
mkdir /data

Create file
echo "Hello Docker" > /data/test.txt

Exit container
exit

List root directory
docker exec -it mycontainer ls /

List files inside /data
docker exec -it mycontainer ls /data

Copy file from container to host
docker cp mycontainer:/data/test.txt C:\Users\HP\Desktop\

Copy file from host to container
docker cp C:\Users\HP\Desktop\test.txt mycontainer:/data/sample.txt

View file content
docker exec -it mycontainer cat /data/sample.txt
