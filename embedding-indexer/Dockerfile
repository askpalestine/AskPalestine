# Use the official Go image as a parent image
FROM golang:1.18 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the local package files to the container's workspace
COPY . .

# Build the Go app
# ARG GOOS=linux
RUN CGO_ENABLED=0 GOOS=${GOOS} go build -a -installsuffix cgo -o index .

# Use a Docker multi-stage build to create a lean production image
# Start from scratch
FROM alpine:latest

# Install ca-certificates for SSL
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/index .

# Command to run the executable
CMD ["./index"]
