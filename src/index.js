//> Inbuilt Functions
const path = require("path");
const http = require("http");
const Filter = require("bad-words");

//> Node Modules
const express = require("express");
const socketio = require("socket.io");

//> Files & Functions
const { generateMessage, locationMessage } = require("./utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

//> App / Server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//> Public Directory
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

//> Connect With User
io.on("connection", (socket) => {
  console.log("New Web Socket Connection to a User");

  //> Receive User Info and Join Chat Room
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    // Send Welcome Message to User
    socket.emit(
      "message",
      generateMessage("SYSTEM", `Welcome ${user.username}!`)
    );

    // Broadcast New User to Other Users
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("SYSTEM", `${user.username} has joined the chatroom`)
      );

    // Send List of Users in the Room to Client
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  //> Receive Message From User & Send to Current Room
  socket.on("formMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  //> Receive Location From User and Send to Current Room
  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      locationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  //> Disconnect User
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("SYSTEM", `${user.username} has left the chatroom.`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

//> Server Start
const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
