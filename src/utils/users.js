const users = [];

//> Capitalize First Letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

//> Add User
const addUser = ({ id, username, room }) => {
  // Clean Data
  username = capitalizeFirstLetter(username.trim().toLowerCase());
  room = capitalizeFirstLetter(room.trim().toLowerCase());

  // Validate Data
  if (!username || !room) {
    return {
      error: "Username and Room are required",
    };
  }

  // Check for Existing User
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  // Validate Username
  if (existingUser) {
    return {
      error: "Username is already taken",
    };
  }

  // Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//> Remove User
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//> Get User
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//> Get User in Room
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
};
