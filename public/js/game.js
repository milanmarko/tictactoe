const socket = io();
var charG = "";
var selectedNum = 0;
var areButtonsDisabled = false;

const turnDisplay = document.getElementById("turnDisplay");
const newGameButton = document.getElementById("newGameButton");
const mySymbol = document.getElementById("mySymbol");
newGameButton.classList.add("disabled");

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
function getPosition(i){
    if (i % 3 == 0){
        return "justify-content-end";
    }
    if (i % 3 == 1){
        return "justify-content-center";
    }
    if (i % 3 == 2){
        return "justify-content-start";
    }
}
function editBoard(board){
    const row1 = document.getElementById("row1");
    const row2 = document.getElementById("row2");
    const row3 = document.getElementById("row3");
    row1.innerHTML = "";
    row2.innerHTML = "";
    row3.innerHTML = "";
    
    for(let i = 0; i < 3; i++){ // First row
        row1.innerHTML += `<div class="col-4 d-flex ${getPosition(i)} text-center game-button-col"><input type="button" class="game-button" id="${i}" onclick="placeOnBoard(${i})" value="${board[i].symbol}" /></div>`
    }
    for(let i = 3; i < 6; i++){ // Second row
        row2.innerHTML += `<div class="col-4 d-flex ${getPosition(i)} text-center game-button-col"><input type="button" class="game-button" id="${i}" onclick="placeOnBoard(${i})" value="${board[i].symbol}" /></div>`
    }
    for(let i = 6; i < 9; i++){ // Third row
        row3.innerHTML += `<div class="col-4 d-flex ${getPosition(i)} text-center game-button-col"><input type="button" class="game-button" id="${i}" onclick="placeOnBoard(${i})" value="${board[i].symbol}" /></div>`
    }

}
function disableGameButtons(){
    document.querySelectorAll(".game-button").forEach(e => {
        e.disabled = true;
        e.classList.add("disabled")
    })
    areButtonsDisabled = true;
}
const initNewGame = (room) => {
    socket.emit("joinRoom", room);
    socket.on("roomJoined", (board, char) => {
        charG = char;
        mySymbol.innerText = char;
        console.log(`Csatlakozva a következő szobához: ${room}`);
        editBoard(board);
        if (char == "X"){
            turnDisplay.innerText = "Egyedül vagy a szobában";
        }
        else{
            turnDisplay.innerText = "A másik játékos következik";
        }
    })
}
socket.once("gamePageConnected", () => {
    const room = getCookie("room");
    document.getElementById("roomName").innerText = room;
    initNewGame(room);
})
const placeOnBoard = (pos) =>{
    socket.emit("placeOnBoard", pos, charG);
}
socket.on("roomFull", () => {
    console.log("nyomja")
    if (charG == "X"){
        turnDisplay.innerText = "Te következel!";
    }
})
socket.on("charPlacedSuccessfully", (board, char) => {
    editBoard(board);
    const newDisplay = char == charG ? "A másik játékos következik" : "Te következel!";
    turnDisplay.innerText = newDisplay;
})
socket.on("win", (board, char) => {
    editBoard(board);
    turnDisplay.innerText = `${char} nyert!`;
    newGameButton.classList.remove("disabled");
    disableGameButtons();
})
socket.on("draw", (board) => {
    editBoard(board);
    turnDisplay.innerText = "Döntetlen!";
    newGameButton.classList.remove("disabled");
    disableGameButtons();
})
const newGame = () => {
    areButtonsDisabled = false;
    newGameButton.classList.add("disabled");
    initNewGame(getCookie("room"));
    // socket.emit("gameOver", getCookie("room"));
}
const keyboardHandler = (e) => {
    const key = e.key;
    var previous;
    var selected = document.getElementById(selectedNum);
    if (areButtonsDisabled){
        if(key == "r"){
            newGame();
        }
        return;
    }
    if (key == "ArrowLeft" || key == "a"){
        try{
            const previousL = selected;
            selected = document.getElementById(`${selectedNum - 1}`);
            if (selected != null){
                previous = previousL;
                selectedNum -= 1;
            }
        }
        catch{}
    }
    else if (key == "ArrowRight" || key == "d"){
        try{
            const previousL = selected;
            selected = document.getElementById(`${selectedNum + 1}`);
            if (selected != null){
                previous = previousL;
                selectedNum += 1;
            }
        }
        catch{}
    }
    else if (key == "ArrowUp" || key == "w"){
        try{
            const previousL = selected;
            selected = document.getElementById(`${selectedNum - 3}`);
            if (selected != null){
                previous = previousL;
                selectedNum -= 3;
            }
        }
        catch{}
    }
    else if(key == "ArrowDown" || key == "s"){
        try{
            const previousL = selected;
            selected = document.getElementById(`${selectedNum + 3}`);
            if (selected != null){
                previous = previousL;
                selectedNum += 3;
            }
        }
        catch{}     
    }
    else if (key == "Enter" || key == ""){
        placeOnBoard(selectedNum);
    }
    else if (key == "r"){
        newGame();
    }
    try{
        previous.classList.remove("selected");
        selected.classList.add("selected");
    }
    catch{}
}
document.onkeyup = keyboardHandler;
// socket.on("newGameReady", () => {
// })
socket.on("error", (err) => {alert(err)})