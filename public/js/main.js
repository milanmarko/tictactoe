const socket = io();


const createRoom = () => {
    socket.emit('createRoom', room);
    socket.on('roomCreated', room => {
        alert(`Szoba létrehozva a következő néven: ${room}`);
        document.cookie = `room=${room}`;
        document.cookie = `creator=true`;
        window.location.href = '/game';
    })
}

const joinRoom = () => {
    const room = document.getElementById('room').value;
    socket.emit('joinRoom', room);
    socket.on('roomJoined', board => {
        document.cookie = `room=${room}`;
        window.location.href = '/game';
    })
}