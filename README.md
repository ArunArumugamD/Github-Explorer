# GitHub Explorer

A web application that allows users to explore GitHub users, their repositories, and followers.

## Features

- Search GitHub users
- View user repositories
- Repository details view
- View user followers
- Caching to avoid redundant API calls

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL

### Frontend
- React
- TypeScript
- Vanilla CSS (No frameworks)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- Git

### Backend Setup
1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd github-explorer/backend
   ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a .env file:
    ```bash
    PORT=3000
    DATABASE_URL=postgres://your_username:your_password@localhost:5432/github_explorer
    NODE_ENV=development
    ```
4. Setup up the database:
    ```bash
    npm run setup-db
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```


### Frontend Setup
1. Navigate to frontend directory:
    ```bash
    cd ../frontend
2. Install dependencies:
    ```bash
    npm install
3. Create a .env file:
    ```bash
    REACT_APP_API_URL=http://localhost:3000/api
    ```
4. Start the development server:
    ```bash
    npm start
    ```

## Application Flow

1. Enter a GitHub username in the search box
2. View user's profile and repositories
3. Click on a repository to see its details
4. Click on followers count to see user's followers
5. Click on a follower to view their profile
6. Use back buttons to navigate between views

## Deployment
The application is deployed on Render:

https://github-explorer-frontend.onrender.com/