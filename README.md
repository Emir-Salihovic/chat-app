# Chat-App Documentation

Welcome to the **Chat-App** project! This document will guide you through the installation, setup, and usage of the Chat-App.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Running the App](#running-the-app)
  - [Building the App](#building-the-app)
  - [Testing the App](#testing-the-app)
- [Docker Support](#docker-support)
- [Scripts](#scripts)
- [Dependencies](#dependencies)

## Introduction

Chat-App is a real-time chat application built with Node.js, Express, and TypeScript. It leverages various modern web development tools and practices to deliver a robust and scalable chat platform.

## Features

- Real-time communication using [Socket.io](http://Socket.io)
- User authentication with JWT
- Rate limiting with Express-Rate-Limit
- Environment configuration with dotenv
- MongoDB integration using Mongoose

## Installation

To get started with the Chat-App, follow these steps:

1.  **Clone the repository:**

    ```
    git clone <https://github.com/yourusername/chat-app.git>
    cd chat-app
    ```

2.  **Install dependencies:** Make sure you have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed.

    ```
    yarn install
    ```

3.  **Set up environment variables:** Create a `.env` file in the root of your project and add the necessary environment variables. Example:

    ```
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/chat-app
    JWT_SECRET=your_jwt_secret
    ```

## Usage

### Running the App

- **Development Mode:**

  ```
  yarn start:dev
  ```

  This will start the server with `nodemon`, which automatically restarts the server on file changes.

- **Production Mode:**

  ```
  yarn start:prod
  ```

  This will start the server in production mode.

### Building the App

To compile the TypeScript code into JavaScript, run:

```
The compiled files will be located in the `dist` directory.

### Testing the App

To run tests using Jest:

yarn test
```

## Docker Support

You can also run the application using Docker. Make sure you have Docker installed on your machine.

- **Start the Docker containers:**

  ```
  yarn docker:up
  ```

- **Stop the Docker containers:**

  ```
  yarn docker:down
  ```

## Scripts

Here are the scripts defined in the `package.json` file and their purposes:

- `start`: Starts the server using `ts-node`.
- `start:dev`: Starts the server in development mode using `nodemon`.
- `start:prod`: Sets `NODE_ENV` to production and starts the server.
- `build`: Compiles TypeScript files to JavaScript.
- `serve`: Sets `NODE_ENV` to production and serves the compiled JavaScript files.
- `docker:up`: Builds and starts the Docker containers.
- `docker:down`: Stops the Docker containers.
- `test`: Runs tests using Jest.

## Dependencies

Here are the key dependencies used in this project:

- **cors**: Enables Cross-Origin Resource Sharing.
- **dotenv**: Loads environment variables from a `.env` file.
- **express**: Web framework for Node.js.
- **express-rate-limit**: Basic rate-limiting middleware for Express.
- **mongoose**: MongoDB object modeling tool.
- **bcryptjs**: Library to hash passwords.
- **cookie-parser**: Parse HTTP request cookies.
- **jsonwebtoken**: Library to sign and verify JSON Web Tokens.
- **nodemon**: Utility that monitors for any changes in your source and automatically restarts your server.
- **jest**: JavaScript testing framework.
- **supertest**: HTTP assertions made easy via superagent.
- **typescript**: Superset of JavaScript which primarily provides optional static typing, classes, and interfaces.

For development dependencies, the project includes type definitions for various packages, testing tools like Jest, and utilities like Prettier for code formatting.

# Socket.io Event Handlers Documentation

This document explains the various Socket.io events and their handlers used in the Chat-App. Each event handler is designed to manage specific real-time interactions within the chat application.

## Table of Contents

- [handleJoinRoom](#handlejoinroom)
- [handleSendMessage](#handlesendmessage)
- [handleCreateRoom](#handlecreateroom)
- [handleDeleteRoom](#handledeleteroom)
- [handleRoomChanged](#handleroomchanged)
- [handleRoomLeaving](#handleroomleaving)
- [handleUserLogout](#handleuserlogout)
- [handleUserTyping](#handleusertyping)
- [initializeSocket](#initializesocket)

## handleJoinRoom

**Event: Join Room**

- **Purpose:** Allows a user to join a room.
- **Details:**
  - Validates the `roomId` and `userId`.
  - Checks if the room exists; if not, emits an error.
  - Adds the user to the room members if not already a member.
  - Sets the user’s online status to true.
  - Notifies other room members about the new user.
  - Joins the user to the Socket.io room.

## handleSendMessage

**Event: Message sent in room**

- **Purpose:** Handles sending messages within a room.
- **Details:**
  - Validates the `userId` and `message`.
  - Constructs a message object with the user's username.
  - Emits the message to all members of the room.

## handleCreateRoom

**Event: Create Room**

- **Purpose:** Notifies the creation of a new room.
- **Details:**
  - Emits a message to all clients about the addition of a new room.

## handleDeleteRoom

**Event: Delete Room**

- **Purpose:** Deletes a room and its associated data.
- **Details:**
  - Validates the `userId` and `roomId`.
  - Deletes the room, all messages in the room, and all room members.
  - Emits a message to all clients about the deletion of the room.
  - Handles errors and emits an error message if the deletion fails.

## handleRoomChanged

**Event: Room Changed**

- **Purpose:** Manages a user changing rooms.
- **Details:**
  - Finds the user's membership in the room.
  - Sets the user's online status to offline.
  - Notifies other room members that the user has changed rooms.

## handleRoomLeaving

**Event: Leave Room**

- **Purpose:** Handles a user leaving a room.
- **Details:**
  - Deletes the user from the room members.
  - Optionally deletes all messages from the user in the room.
  - Notifies other room members that the user has left the room.

## handleUserLogout

**Event: User Logout**

- **Purpose:** Manages user logout and online status.
- **Details:**
  - Finds all rooms the user is part of.
  - Sets the user's online status to offline in all rooms.
  - Notifies all clients that the user has logged out.

## handleUserTyping

**Event: User Typing**

- **Purpose:** Manages user typing notifications.
- **Details:**
  - Emits a notification to other clients when the user starts typing.
  - Emits a notification to other clients when the user stops typing.

## initializeSocket

**Function: initializeSocket**

- **Purpose:** Initializes Socket.io and sets up all event handlers.
- **Details:**
  - Listens for user connections.
  - Sets up all defined event handlers for each connected socket.
  - Handles disconnections and performs any necessary cleanup.
