const socket = io();
var charG = "";

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}
function editBoard(board){
    document.getElementById("buttons").innerHTML = "";
    for(var i = 0; i < board.length;i++){
        document.getElementById("buttons").innerHTML += `<input type="button" id="${i}" onclick="placeOnBoard(${i})" value="${board[i].symbol}" />${(i+1) % 3 == 0 ? "<br>" : ""}`;
    }
}
socket.once("gamePageConnected", () => {
    const room = getCookie("room");
    socket.emit("joinRoom", room);
    socket.on("roomJoined", (board, char) => {
        charG = char;
        console.log(`Csatlakozva a következő szobához: ${room}`);
        editBoard(board);
    })
})

const placeOnBoard = (pos) =>{
    socket.emit("placeOnBoard", pos, charG);
}

socket.on("charPlacedSuccessfully", (board) => {
    editBoard(board);
})
socket.on("win", (board, char) => {
    editBoard(board);
    alert(`${char} won!`);
})
socket.on("draw", (board) => {
    editBoard(board);
    alert("Draw!");
})
const gameEnded = () => {

}
socket.on("error", (err) => {alert(err)})