# Day 1 – Docker Basics

Goal: Understand Docker images and how to run containers.

Use Case:
A developer needs to quickly run software like Ubuntu or Nginx
without installing it directly on the system.

Commands Used

Check Docker version
docker --version

List docker images
docker images

Download images from Docker Hub
docker pull ubuntu
docker pull nginx
docker pull alpine

Run a container
docker run hello-world

Run interactive Ubuntu container
docker run -it ubuntu

Run Nginx web server
docker run -d -p 8080:80 nginx

Remove unused images
docker image prune
