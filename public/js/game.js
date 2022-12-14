const socket = io();
var charG = "";
var selectedNum = 0;
var areButtonsDisabled = false;
var isVisitor = false;
var lastPlaced = "X";

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
    socket.on("roomJoined", (board, role, lastPlaced) => {
        editBoard(board);
        if (role == "visitor"){
            if (confirm("M??r csak n??z??k??nt f??rsz el ebben as zob??ban!\n??gy is szeretn??d folytatni?")){
                disableGameButtons();
                isVisitor = true;
                mySymbol.innerHTML = "N??z?? vagy!";
                turnDisplay.innerText = lastPlaced == "X" ? "Jelenlegi l??p?? j??t??kos: O" : "Jelenlegi l??p?? j??t??kos: X";
            }
        }
        else{
            charG = role;
            mySymbol.innerText = role;
            console.log(`Csatlakozva a k??vetkez?? szob??hoz: ${room}`);
            if (role == "X"){
                turnDisplay.innerText = "Egyed??l vagy a szob??ban";
            }
            else{
                turnDisplay.innerText = "A m??sik j??t??kos k??vetkezik";
            }
        }
    })
}
socket.once("gamePageConnected", () => {
    const room = getCookie("room");
    document.getElementById("roomName").innerText = room;
    initNewGame(room);
})
const placeOnBoard = (pos) =>{
    if (isVisitor){
        alert("N??z?? vagy!");
    }
    else{
        socket.emit("placeOnBoard", pos, charG);
    }
}
socket.on("roomFull", (board) => {
    if (charG == "X"){
        turnDisplay.innerText = "Te k??vetkezel!";
    }
})
socket.on("charPlacedSuccessfully", (board, char) => {
    editBoard(board);
    lastPlaced = char;
    var newDisplay;
    if (charG != ""){
        newDisplay = lastPlaced == charG ? "A m??sik j??t??kos k??vetkezik" : "Te k??vetkezel!";
    }
    else{
        newDisplay = lastPlaced == "X" ? "Jelenlegi j??t??kos: O" : "Jelenlegi j??t??kos: X";
    }
    turnDisplay.innerText = newDisplay;
})
socket.on("win", (board, char) => {
    editBoard(board);
    turnDisplay.innerText = `${char} nyert!`;
    if(!isVisitor){
        newGameButton.classList.remove("disabled");
        disableGameButtons();
    }
    else{
        visitorNewGame();
        turnDisplay.innerText += "\nV??rakoz??s hogy a j??t??kosok ??j j??t??kot ind??tsanak";
    }
})
socket.on("draw", (board) => {
    editBoard(board);
    turnDisplay.innerText = "D??ntetlen!";
    if(!isVisitor){
        newGameButton.classList.remove("disabled");
        disableGameButtons();
    }
    else{
        visitorNewGame();
        turnDisplay.innerText += "\nV??rakoz??s hogy a j??t??kosok ??j j??t??kot ind??tsanak";
    }
})
const newGame = () => {
    areButtonsDisabled = false;
    newGameButton.classList.add("disabled");
    initNewGame(getCookie("room"));
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
    switch(key){
        case "ArrowLeft" || "a":
            try{
                const previousL = selected;
                selected = document.getElementById(`${selectedNum - 1}`);
                if (selected != null){
                    previous = previousL;
                    selectedNum -= 1;
                }
            }
            catch{}
            break;

        case "ArrowRight" || "d":
            try{
                const previousL = selected;
                selected = document.getElementById(`${selectedNum + 1}`);
                if (selected != null){
                    previous = previousL;
                    selectedNum += 1;
                }
            }
            catch{}
            break;

        case "ArrowUp" || "w":
            try{
                const previousL = selected;
                selected = document.getElementById(`${selectedNum - 3}`);
                if (selected != null){
                    previous = previousL;
                    selectedNum -= 3;
                }
            }
            catch{}
            break;

        case "arrowDown" || "s":
            try{
                const previousL = selected;
                selected = document.getElementById(`${selectedNum + 3}`);
                if (selected != null){
                    previous = previousL;
                    selectedNum += 3;
                }
            }
            catch{}
            break; 

        case "Enter":
            placeOnBoard(selectedNum);
            break;
        
        case "r":
            if (!isVisitor){
                newGame();
            }
            break;
    }
    try{
        previous.classList.remove("selected");
        selected.classList.add("selected");
    }
    catch{}
}
const visitorNewGame = () => {
    socket.on("roomFull", (board) => {
        editBoard(board);
        turnDisplay.innerText = "Jelenlegi j??t??kos: X";
    })
}
document.onkeyup = keyboardHandler;
// socket.on("newGameReady", () => {
// })
socket.on("error", (err) => {alert(err)})