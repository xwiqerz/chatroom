
// Get peer id (hash) from URL.
let getPeerId = window.location.hash.split("#")[1];

// Connect to Peer server
peer = new Peer(getPeerId, {
    host:"glajan.com",
    port: 8443,
    path:"/myapp",
    secure: true,
});

// Print pear id on connection "open" event.
peer.on("open", (id) => {
const myPeerIdEl = document.querySelector(".my-peer-id")
myPeerIdEl.innerHTML = id;
});
peer.on("error",(errorMessage)=> {
    console.error(errorMessage)
})

// Event listener for click "Refresh list"
const listPeersButtonEl = document.querySelector(".list-all-peers-button")
const listAllPeersEl = document.querySelector(".peers")

listPeersButtonEl.addEventListener("click", () => {
    peer.listAllPeers((peers) => {
        const listItems = peers
        .filter((peerId) => peerId !== peer._id)
        .map((peers) => {
            return `
            <li>
                <button class="connect-button-peerId-${peers}">${peers}
            </li>
            `
        })
        .join("");

        listAllPeersEl.innerHTML = listItems;
    })
})
