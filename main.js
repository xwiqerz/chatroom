(function () {
  const peersEl = document.querySelector(".peers");
  let dataConnection = null;
  const sendButtonEl = document.querySelector(".send-new-message-button");
  let newmessageEl = document.querySelector(".new-message");
  const messagesEl = document.querySelector(".messages");
  const theirVideoContainer = document.querySelector(".video-container.them")

  const printMessage = (text, who) => {
    const messageEl = document.createElement("div");
    messageEl.classList.add("message", who);
    messageEl.innerHTML = `<div>${text}</div>`;
    messagesEl.append(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  // get peer id from UR (no hash)
  const myPeerId = location.hash.slice(1);

  // connect to peer server
  let peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { urls: ["stun:eu-turn7.xirsys.com"] },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          urls: [
            "turn:eu-turn7.xirsys.com:80?transport=udp",
            "turn:eu-turn7.xirsys.com:3478?transport=udp",
            "turn:eu-turn7.xirsys.com:80?transport=tcp",
            "turn:eu-turn7.xirsys.com:3478?transport=tcp",
            "turns:eu-turn7.xirsys.com:443?transport=tcp",
            "turns:eu-turn7.xirsys.com:5349?transport=tcp",
          ],
        },
      ],
    },
  });

  // print peer id on connection "open" event.
  peer.on("open", (id) => {
    const myPeerIdEl = document.querySelector(".my-peer-id");
    myPeerIdEl.innerText = id;
  });

  // error message if there is an error
  peer.on("error", (errorMessage) => {
    console.error(errorMessage);
  });

  peer.on("connection", (connection) => {
    //close existing connetcion and set new connection
    dataConnection && dataConnection.close();
    dataConnection = connection;

    const event = new CustomEvent("peer-changed", { detail: connection.peer });
    document.dispatchEvent(event);

    /* dataConnection.on("data", (textMessage) => {
      printMessage(textMessage);
    }); */
  });

  // event listener for click "refresh list"

  const refreshPeersButtonEl = document.querySelector(".list-all-peers-button");
  refreshPeersButtonEl.addEventListener("click", (e) => {
    peer.listAllPeers((peers) => {
      // add peers to html document
      const peersList = peers
        // filter out our own name
        .filter((peerId) => peerId !== peer._id)
        // loop through all peers and print them as buttons in a list
        .map((peer) => {
          return `
        <li>
        <button class="connect-button peerId-${peer}">${peer}</button>
        </li>
        `;
        })
        .join("");
      peersEl.innerHTML = `<ul>${peersList}</ul>`;
    });
  });

  // event listeneer for click peer button
  peersEl.addEventListener("click", (event) => {
    if (!event.target.classList.contains("connect-button")) return;
    //console.log(event.target);

    // listen for custom event 'peer changed''
    document.addEventListener("peer-changed", (event) => {
      //console.log(event);
    });

    // get peerId from button element
    const theirPeerId = event.target.innerText;

    //close existing connection ... online lösning istället för if-sats (if dataConnection)
    dataConnection && dataConnection.close();

    // connect to peer
    dataConnection = peer.connect(theirPeerId);
    //console.log(dataConnection);
    dataConnection.on("open", () => {
      //console.log("connection open");
      // dispatch Custom event with connected peer id
      const event = new CustomEvent("peer-changed", {
        detail: theirPeerId,
      });
      document.dispatchEvent(event);
    });
  });

  //event listener for custom event ´peer-chagend´
  document.addEventListener("peer-changed", (event) => {
    const peerId = event.detail;

    const connectButtonEl = document.querySelector(
      `.connect-button.peerId-${peerId}`
    );
    
    // Only one peer can have the class connected, removes the rest!
    document.querySelectorAll(".connect-button.connected").forEach((button) => {
      button.classList.remove("connected");
    });

    // Add class connected to clicked button
    connectButtonEl.classList.add("connected");

    // console.log(connectButtonEl);
    // Listen for incoming data
    dataConnection.on("data", (textMessage) => {
      printMessage(textMessage, "them");
    });
    // Focus på inputen
    newmessageEl.focus();

    theirVideoContainer.querySelector(".name").innerText = peerId;
    theirVideoContainer.classList.add("connected");
    theirVideoContainer.querySelector(".start").classList.add("active")
    theirVideoContainer.querySelector(".stop").classList.remove("active")
  });

  // Send message to peer
  const sendMessage = (e) => {
    if (newmessageEl.value === "") return;
    if (e.keyCode === 13 || e.type === "click") {
      if (!dataConnection) return;
      dataConnection.send(newmessageEl.value);
      printMessage(newmessageEl.value, "me");
      newmessageEl.value = "";
    }
  };

  newmessageEl.focus();
  // Nu funkar det när man klickar + enter knappen
  sendButtonEl.addEventListener("click", sendMessage);
  newmessageEl.addEventListener("keyup", sendMessage);

  // Event listener for click "Start Video chat"
  const startVideoButton = theirVideoContainer.querySelector(".start.active")
  const stopVideoButton = theirVideoContainer.querySelector(".stop")
  startVideoButton.addEventListener("click", () => {
    startVideoButton.classList.remove("active");
    stopVideoButton.classList.add("active");
  })
})();
