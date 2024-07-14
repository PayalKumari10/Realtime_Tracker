const socket = io();

// Check for geolocation support and watch position
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude });
    }, 
    (error) => {
        console.log(error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "StreetMap-byPayalKri"
}).addTo(map);

// Store markers by user ID
const markers = {};

// Listen for incoming location data from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        // Update the marker's position
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker if it doesn't exist
        markers[id] = L.marker([latitude, longitude]).addTo(map);
             
    }
});

// Remove markers when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
