# Documentation

## Git Repository Organization

### Branching and Updates
**Initial Setup**: 
- The project began with basic setup and component initialization.

**Development**:
- Commits were regularly made to include new features and fixes, such as:
  - Extensive Chat functionality
  - User Profile management
  - Admin and super admin features
- Created branches for code cleaning and testing.
- Merged cleaning and testing branches into the main branch.

**Update Frequency**:
- Commits were made frequently, focusing on specific features and bug fixes.
- Notable features ScreenShare Functionality, UI Theme choice and Password Encryption.

## Data Structures

### Server-Side
- **Users**:
  - `id`: Unique Number
  - `username`: String
  - `email`: String
  - `password`: String (hashed)
  - `roles`: Array of Strings (e.g., `['admin', 'superAdmin']`)
  - `groups`: Array of Strings
  - `avatar`: String (URL to the avatar image)
  - `theme`: String (e.g., 'light' or 'dark')

- **Groups**:
  - `id`: Unique Number
  - `name`: String
  - `ownerName`: String
  - `admins`: Array of Strings (usernames)
  - `members`: Array of Numbers (UserIDs)
 
- **Requests**:
  - `username`: String
  - `reason`: String
  - `groupId`: Unique Number
 
#### Via MongoDB

- **Channels**:
  - `id`: Unique Number
  - `name`: String
  - `groupId`: Unique Number

- **Messages**:
  - `channelId`: Unique Number
  - `username`: String
  - `avatar`: String (URL to the user's avatar)
  - `text`: String
  - `image`: String (URL to an uploaded image)
  - `timestamp`: Date

- **Banned Users**
- `channelId`: Unique Number
- `username`: String
- `reason`: String

## Client-Server Responsibilities

- **Client Responsibilities**:
  - Handle user authentication and registration.
  - Manage user profiles, including theme and avatar.
  - Provide the UI for group and channel management.
  - Fetch and display messages from channels.

- **Server Responsibilities**:
  - Provide a REST API for user management, group management, channel management, message handling, and request management.
  - Store data persistently using MongoDB.
  - Handle file uploads for images and avatars.
  - Emit real-time updates using WebSockets for chat messages.

## API Routes

### List of Routes
- **User Management**:
  - `POST /registerUser`: Register a new user.
    - **Parameters**: `username`, `password`, `email`
    - **Return**: Success message or error.
  
  - `POST /loginUser`: Authenticate a user.
    - **Parameters**: `username`, `password`
    - **Return**: User info without password or error.

  - `DELETE /deleteUser/:username`: Delete a user by username.
    - **Return**: Success message or error.

- **Group Management**:
  - `POST /manageGroup/create`: Create a new group.
    - **Parameters**: `name`, `ownerName`, `adminId`
    - **Return**: Success message and group data.

  - `GET /manageGroup`: Get all groups.
    - **Return**: List of groups.

  - `DELETE /manageGroup/delete/:id`: Delete a group by ID.
    - **Return**: Success message or error.

- **Channel Management**:
  - `POST /manageChannel/create`: Create a new channel.
    - **Parameters**: `name`, `groupId`
    - **Return**: Success message and channel data.

  - `GET /manageChannel`: Get all channels.
    - **Return**: List of channels.

  - `DELETE /manageChannel/delete/:id`: Delete a channel by ID.
    - **Return**: Success message or error.

- **Message Management**:
  - `POST /manageMessages/send`: Send a message.
    - **Parameters**: `channelId`, `username`, `avatar`, `text`
    - **Return**: Success message and sent message data.

  - `GET /manageMessages/:channelId`: Get messages for a specific channel.
    - **Return**: List of messages.

## Angular Architecture

### Components
- **AppComponent**: Main component handling routing and layout.
- **RegisterComponent**: Handles user registration.
- **LoginComponent**: Manages user login.
- **ProfileComponent**: Displays and manages user profile details.
- **ChatComponent**: Manages group and channel chat functionality.
- **VideoCallComponent**: Manages Video call & ScreenShare functionality.
  
### Routes
- `/register`: Route to the Register component.
- `/login`: Route to the Login component.
- `/chat`: Route to the Chat component.
- `/video-call`: Route to the Video Call component.
- `/profile`: Route to the Profile component.

## Client-Server Interaction

### Data Changes
- **User Actions**: User actions such as creating a group, sending a message, or updating a profile trigger server-side operations that update local storage and/or database.
- **Display Updates**: Angular components update the UI based on data received from the server or changes in local state.

### Component Updates
- **Register/Login**: Submitting forms triggers server requests to create or authenticate a user.
- **Chat**: Selecting a group or channel updates the view and fetches messages from the server.
- **Profile**: Fetches user details from the server and updates the view.
- **Real-Time Updates**: Uses SocketIO to listen for new messages and user actions, updating the chat interface accordingly.
