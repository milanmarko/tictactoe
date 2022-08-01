const socket = io();


const createRoom = () => {
    socket.emit('createRoom', "dummy");
    socket.on('roomCreated', room => {
        alert(`Szoba létrehozva a következő néven: ${room}`);
        document.cookie = `room=${room}`;
        window.location.href = '/game';
    })
}

const joinRoom = () => {
    const room = document.getElementById('roomNameTB').value;
    socket.emit('joinRoom', room);
    socket.on('roomJoined', board => {
        document.cookie = `room=${room}`;
        window.location.href = '/game';
    })
}

socket.on('error', err => {alert(err)})