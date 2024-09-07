# Documentation

## Git Repository Organization

### Branching and Updates
**Initial Setup**: 
- The project began with basic setup and component initialization.

**Development**:
  - Commits were regularly made to include new features and fixes, such as:
    - Basic chat functionality
    - User account management
    - Admin and super admin features
  - Created branch for code cleaning.
  - Merged cleaning branch into the main branch.

**Update Frequency**:
  - Commits were made frequently, with a focus on specific features and bug fixes.
  - Commits include adding functionality like group and channel management, user requests, and permissions.


## Data Structures

### Client-Side & Server-Side
- **Users**:
  - `id`: Unique Number
  - `username`: String
  - `email`: String
  - `roles`: Array of Strings (e.g., `['admin', 'superAdmin']`)
  - `groups`: Array of Strings
- **Groups**:
  - `id`: String
  - `name`: String
  - `ownerName`: String
  - `admins`: Array of Strings
  - `members`: Array of Strings
- **Channels**:
  - `id`: String
  - `name`: String
  - `groupId`: String
- **Messages**:
  - `channelId`: String
  - `username`: String
  - `text`: String


## Angular Architecture

### Components
- **Register Component**: Handles user registration.
- **Login Component**: Manages user login.
- **Chat Component**: Manages group and channel chat functionality.
- **Profile Component**: Displays and manages user profile details.
  
### Models
- **UserModel**: Represents user data.
- **GroupModel**: Represents group data.
- **ChannelModel**: Represents channel data.
- **MessageModel**: Represents message data.

### Routes
- `/register`: Route to the Register component.
- `/login`: Route to the Login component.
- `/chat`: Route to the Chat component.
- `/profile`: Route to the Profile component.

## Node Server Architecture

### Modules
- **server.js**: Handles server operations

### Functions
  - `registerUser()`: Registers a new user.
  - `loginUser()`: Authenticates a user.
  - `createGroup()`: Creates a new group.
  - `deleteGroup()`: Deletes a group.
  - `addMember()`: Adds a member to a group.
  - `removeMember()`: Removes a member from a group.
  - `sendMessage()`: Sends a message to a channel.
  - `getMessages()`: Retrieves messages for a channel.

### Files
- **server.js**: Entry point for the server, sets up middleware and routes.
- **config.js**: Configuration settings for the server.

## Client-Server Interaction

### Data Changes
- **User Actions**: User actions such as creating a group or sending a message trigger server-side operations to update the local storage.
- **Display Updates**: Angular components update the UI based on data received from the server or changes in the local state.

### Component Updates
- **Register/Login**: Submitting forms triggers server requests to create or authenticate a user, respectively.
- **Chat**: Selecting a group or channel updates the view and fetches messages from the server.
- **Profile**: Fetches user details from the server and updates the view.



