# Project: MSN - Omegle Clone

P.S: this was build live on twitch: [https://twitch.tv/stormix_dev](https://twitch.tv/stormix_dev)

## Description

MSN is an Omegle clone built using Bun, TypeScript, and React. It allows users to anonymously chat with strangers in a one-on-one video chat. The project is divided into two main components: the client, which is a web application built using Vite and React with TypeScript, and the server, which is responsible for managing user connections and chat sessions using Bun and TypeScript.

## Features

- Real-time, anonymous text chat with strangers.
- User-friendly and intuitive interface.
- Random pairing with other online users.
- The server maintains chat sessions and ensures secure communication.

## Project Structure

The project is organized into two subfolders:

1. **client:** This folder contains the client-side code, which is responsible for the web application's user interface. It is built using Vite and the React TypeScript template.

2. **server:** This folder contains the server-side code, which handles user connections and chat sessions. It is built using Bun and TypeScript.

## Getting Started

Follow the steps below to get the MSN project up and running on your local machine:

### Client

1. Navigate to the `client` folder using your terminal.

2. Install the project dependencies using Bun:

   ```bash
   bun install
   ```
  
3. Start the client development server with Bun:


   ```bash
    bun run dev
   ```

This will launch the client application, and you can access it in your web browser at http://localhost:3000.

### Server
1. Navigate to the `server` folder using your terminal.

2. Install the project dependencies using Bun:

  ```bash
   bun install
   ```
  
3. Start the server with Bun:

   ```bash
    bun run dev
   ```

The server will run on port 3000 for the bun websockets and 9000 for the Peerjs broker.


## Contributing
If you would like to contribute to the MSN project, please follow these guidelines:

- Fork the repository on GitHub.

- Create a new branch for your feature or bug fix.

- Implement your changes and ensure that the code is well-documented.

- Write tests for your code, if applicable.

- Create a pull request to the main repository's main branch.

- Wait for code review and address any feedback.

## License

This project is licensed under the MIT License. For more information, please see the [LICENSE](./LICENSE) file.

## Contact

If you have any questions or need assistance with the MSN project, please feel free to contact the maintainers: <hello@stormix.co>



