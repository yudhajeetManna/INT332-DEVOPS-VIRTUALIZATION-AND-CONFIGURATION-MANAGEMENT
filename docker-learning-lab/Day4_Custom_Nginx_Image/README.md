# Day 4 – Custom Nginx Docker Image

Goal:
Build a custom Docker image that serves a web page.

Use Case:
A DevOps engineer wants to deploy a simple website
using Docker without installing Nginx manually.

Files

index.html → Web page  
default.conf → Nginx configuration  
Dockerfile → Instructions to build image

Commands

Build image
docker build -t custom-nginx:v1 .

Run container
docker run -d -p 8080:80 --name nginx-container custom-nginx:v1

Access website
http://localhost:8080
