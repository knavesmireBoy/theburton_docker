FROM busybox:1.35

# Create a non-root user to own the files and run our server
RUN adduser -D static
USER static
WORKDIR /home/theburton

# Copy the static website
# Use the .dockerignore file to control what ends up inside the image!
COPY . .

# Run BusyBox httpd
EXPOSE 3000
#CMD ["busybox", "httpd", "-f", "-v", "-p", "3000"]
