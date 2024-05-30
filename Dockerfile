# Use Node.js v20.11.1
FROM node:20.11.1-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install the angular cli
RUN npm install -g @angular/cli

# Install the dependencies (NG CLI)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Expose the port the app runs on
EXPOSE 4200

# Define the command to run the application
CMD ["ng", "serve", "--host", "0.0.0.0"]