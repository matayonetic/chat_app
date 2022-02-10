//> Load Socket
const socket = io();

//> Elements From chat.html
const $form = document.querySelector("#message-form");
const $formInput = $form.querySelector("input");
const $formButton = $form.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

//> Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

//> Auto-Scrolling
const autoScroll = () => {
  // New Message Element
  const $newMessage = $messages.lastElementChild;

  // Height of New Message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of Messages Container
  const containerHeight = $messages.scrollHeight;

  // How Far Have I Scrolled
  const scrollOffSet = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffSet) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//> User Login
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//> Join the Chatroom
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

//> Receive List of Users in a Room
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

//> Send Message to the Server
$form.addEventListener("submit", (e) => {
  e.preventDefault();

  $formButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.formMessage.value;

  socket.emit("formMessage", message, (error) => {
    $formButton.removeAttribute("disabled");
    $formInput.value = "";
    $formInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

//> Receive a Message From the Server
socket.on("message", (serverMessage) => {
  const html = Mustache.render(messageTemplate, {
    username: serverMessage.username,
    message: serverMessage.text,
    createdAt: moment(serverMessage.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

//> Send Location
$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (serverMessage) => {
        $locationButton.removeAttribute("disabled");
        console.log("Location Shared");
      }
    );
  });
});

//> Receive Location Message From Server
socket.on("locationMessage", (lMessage) => {
  const html = Mustache.render(locationTemplate, {
    username: lMessage.username,
    url: lMessage.url,
    createdAt: moment(lMessage.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});
