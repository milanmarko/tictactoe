const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketio = require('socket.io');
const fs = require('fs');

const io = socketio(server);

const port = process.env.PORT || 6969;

app.use(express.static('public'));
app.set('view engine', 'ejs');


function generateRoomName() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 16; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
function drawCheck(board){
    var hasEmpty = false;
    board.forEach(element =>{
        if(element.symbol == " "){
            hasEmpty = true;
        }
    })
    if(hasEmpty){
        return false;
    }
    return true;
}
function winCheck(board){
    if(board[0].symbol == board[1].symbol && board[1].symbol == board[2].symbol && board[0].symbol != " "){
        return true;
    }
    if(board[3].symbol == board[4].symbol && board[4].symbol == board[5].symbol && board[3].symbol != " "){
        return true;
    }
    if(board[6].symbol == board[7].symbol && board[7].symbol == board[8].symbol && board[6].symbol != " "){
        return true;
    }
    if(board[0].symbol == board[3].symbol && board[3].symbol == board[6].symbol && board[0].symbol != " "){
        return true;
    }
    if(board[1].symbol == board[4].symbol && board[4].symbol == board[7].symbol && board[1].symbol != " "){
        return true;
    }
    if(board[2].symbol == board[5].symbol && board[5].symbol == board[8].symbol && board[2].symbol != " "){
        return true;
    }
    if(board[0].symbol == board[4].symbol && board[4].symbol == board[8].symbol && board[0].symbol != " "){
        return true;
    }
    if(board[2].symbol == board[4].symbol && board[4].symbol == board[6].symbol && board[2].symbol != " "){
        return true;
    }
    return false;
}
io.on('connection', socket => {
    const scheme = fs.readFileSync('public/json/scheme.json');
    socket.emit("gamePageConnected");
    socket.on('createRoom', room => {
        const roomName = generateRoomName();
        fs.readFile(`games/${roomname}.json`, (err, data) => { // Checks if game name already exists
            if (err){
                socket.emit('roomCreated', roomName);
                fs.writeFile(`games/${roomName}.json`, scheme, (err) => {});
            }
        })
    })
    socket.on('joinRoom', room => {
        fs.readFile(`games/${room}.json`, (err, data) => { 
            const board = JSON.parse(data).board;           
            socket.join(room);
            roomSize = io.sockets.adapter.rooms.get(room).size;
            if (roomSize== 1){
                char = "X";
                socket.emit('roomJoined', board, char);
            }
            else if (roomSize == 2){
                char = "O";
                socket.emit('roomJoined', board, char);
            }
            else{
                socket.emit('error', 'Room is full!');
            }
        })
    })
    socket.on('placeOnBoard', (pos, char) => {
        const [, room] = socket.rooms;
        fs.readFile(`games/${room}.json`, (err, data) => {
            const jsonFile = JSON.parse(data);
            const selected = jsonFile.board[pos];
            const lastMove = jsonFile.lastMove;
            if (lastMove == char){
                socket.emit('error', "It's not your turn");
                return;
            };
            if (selected.symbol == " "){
                jsonFile.board[pos].symbol = char;
                jsonFile.lastMove = char;
                const board = jsonFile.board;
                fs.writeFile(`games/${room}.json`, JSON.stringify(jsonFile), (err) => {});
                // socket.emit('charPlacedSuccessfully', board);
                if(winCheck(board)){
                    io.to(room).emit('win', board, char);
                    return
                }
                else{
                    if(drawCheck(board)){
                        io.to(room).emit('draw', board);
                        return
                    }
                }
                io.to(room).emit('charPlacedSuccessfully', board);
            }
            else{
                socket.emit('error', 'Tile already used!');
            }
        })
    })    
})

app.get('/', (req, res) => {
    res.render('index');
})
app.get('/game', (req, res) => {
    res.render('game');
})
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})