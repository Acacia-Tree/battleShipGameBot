const shipVolume = 368;//
let currentShipVolume = 0;
let mapArray = []; // wave перерабатывает это
let cleanMapArray = []; // after leveMap has been called on it and wave hasn't been used on it, and so i don't have to count it again
let moveArray = [{x: null, y: null}]; //путь перемещения
let bestPortId = -1; //this is current bestPort, needed to find out if the bestPort is now another port, in order to know when to recalculate the wave

let value = false; //for pirate test
let lastPirateMove = [];//хранит только последний ход каждого пирата
export function startGame(levelMap, gameState) {
    mapArray = levelArray(levelMap);
    cleanMapArray = cloneArray(mapArray, 2);
    wave(gameState);
    let newArray = mapArray.map(el => el.map(el => el.mapValue));
        console.table(newArray);
        console.table(moveArray);
    
    
    lastPirateMove = cloneArray(gameState.pirates, 1);
    console.table(lastPirateMove);

}

function cloneArray(arr, dimension) {//for copying arrays WITH OBJECTS
    var result = [];
    if (dimension == 2) {
        for (let i = 0; i < arr.length; i++) {
            let row = []
            for (let j = 0; j < arr[0].length; j++) {
                let element = {};
                for (var prop in arr[i][j]) {
                    element[prop] = arr[i][j][prop];
                }
                row.push(element);
            }
            result.push(row);
        }
    } else if (dimension == 1) {
        for (let i = 0; i < arr.length; i++) {
            let element = {};
            for (var prop in arr[i]) {
                element[prop] = arr[i][prop];
            }
            result.push(element);
        }
    }
    
    return result;
}

function getMoveArray(yStart, xStart) { //does it write it down normally? sometimes it works as expected, sometimes it's array islonger than needed, usually when i press startgame two times in a row, same level
    //when i refresh before each start it works as expected, perhaps this is because of my globals not refreshing each time. i should initialize them in startGame and put them in classes
    moveArray[0] = {x: xStart, y: yStart}; 
    let lastIndex = moveArray.length - 1;
    let minWaveValue = 253;
    let minX = -1; // not really used
    let minY = -1;
    let count = 0; //make sure it doesn't do too much
    while (minWaveValue != 0 && count < 64) { //until we reach the end point (which will be in the last array element)
        let x = moveArray[lastIndex].x;
        let y = moveArray[lastIndex].y;

        let dy = [1, 0, -1, 0];// смещения, соответствующие соседям ячейки !!!!!!!!!!!!!!!!!!!!!! 
        let dx = [0, 1, 0, -1];//справа, снизу, селва и сверху
        for (let k = 0; k < 4; k++) {
            if (mapArray[y + dy[k]][x + dx[k]].waveValue < minWaveValue ) {
                minWaveValue = mapArray[y + dy[k]][x + dx[k]].waveValue;
                minY = y + dy[k];
                minX = x + dx[k];
            }
        }
        if (minX != -1 && minY != - 1) {
            moveArray.push({x: minX, y: minY});
        }
        lastIndex = moveArray.length - 1;
        count++;
    } 
    return moveArray;
}
function bestPort(gameState) { 
    let ports = gameState.ports;
    let prices = gameState.prices;
    let goods = gameState.goodsInPort;
    let maxPrice = 0;
    let bestGoodsIndex = -1;
    let bestPortIndex = -1;
    for (let i = 1; i < ports.length; i++) {
        let currentGoodsIndex = profitIndex(gameState, i);
        let currentPrice = productProfit(gameState, currentGoodsIndex, i);
        if (currentPrice > maxPrice) {
            maxPrice = currentPrice;
            bestGoodsIndex = currentGoodsIndex;
            bestPortIndex = i;
        }
    }
    return bestPortIndex;  
}

function wave(gameState) {
    let Ni = 0; //счетчик итераций, повторений
    let Nk = 24; //максимальное возможное число итераций от балды
   let finishId = bestPort(gameState);
   let ports = gameState.ports;
   let xFinish = ports[finishId].x + 1; //+1 because of padding OK!
   let yFinish = ports[finishId].y + 1; 
    mapArray[yFinish][xFinish].waveValue = 253; //стартовая точка
    mapArray[gameState.ship.y + 1][gameState.ship.x + 1].waveValue = 0; //конечная точка //+1 for padding OK!
    let dx = [1, 0, -1, 0];// смещения, соответствующие соседям ячейки
    let dy = [0, 1, 0, -1];//справа, снизу, слева и сверху
    
    let lastWave = [{x: gameState.ship.x + 1, y: gameState.ship.y + 1}];
    let currentWave = [];
    console.log("im here");
    while (Ni <= Nk) {
        for (let i = 0; i < lastWave.length; i++) {
            let y  = lastWave[i].y;
            let x = lastWave[i].x;
            for (let k = 0; k < 4; k++) {
                let iy = y + dy[k];
                let ix = x + dx[k];
                if (mapArray[iy][ix].waveValue == 253) {
                    getMoveArray(iy, ix); 
                    return true;
                } 
                if (mapArray[iy][ix].waveValue == 254) {
                    mapArray[iy][ix].waveValue = Ni + 1;
                    currentWave.push({x: ix, y: iy});
                } 
            }
        }
        Ni++;
        lastWave = currentWave.slice();
        currentWave = [];
    }
    return false;//поиск маршрута неудачное
}
function levelArray(levelMap) { // без стартовой точки, конечной точки;
    //consider trim and split
    let rowLength = 0; 
    let enter = 0;//counts
    let n = 0;
    while (enter < 1) {
        if (levelMap[n] == '\n') {
            enter++;
        } else {
            rowLength++;
        }
        n++;
    }
    let columnLength = 1; 
    n = 0;
    while (n != levelMap.length) {
        if (levelMap[n] == '\n') {
            columnLength++
        }
        n++;
    }

    columnLength += 2;
    rowLength += 2; //to count the extra for the resulting array
    let array = [];
    let mapValue, waveValue;
    n = 0;
    for (let i = 0; i < columnLength ; i++) {
        array.push([]);
        for (let j = 0; j < rowLength ; j++) {
            if ((j == 0) || (i == 0) || (j == (rowLength - 1)) || (i == (columnLength - 1))) {
                mapValue = "E";
                waveValue = 255;
               /* if ((j == (rowLength - 1)) || (i == (columnLength - 1))) {
                    n++;
                }*/
            } else {
                if (levelMap[n] != '\n'){
                    mapValue = levelMap[n];
                    if (levelMap[n] == '#') {
                        waveValue = 255; //непроходимо
                    } else if (levelMap[n] == '~' || levelMap[n] == 'H' || levelMap[n] == 'O' ) {
                        waveValue = 254; //проходимо
                    } 
                } else { //пропускаем enter И ничего не записывваем и не итерируем
                    j--;
                }
                n++;
            }
            array[i][j] = {mapValue: mapValue, waveValue: waveValue};
        }    
    }
    return array;

}
function loadAmount (productInPort) { //goodsInPort with chosen index
    let maxAllowed = Math.floor(shipVolume / productInPort.volume); // max allowed on ship
    return (productInPort.amount <= maxAllowed) ? productInPort.amount : maxAllowed; //Итоговый loadamount
}
function productProfit (gameState, index, portId) {//считает прибыль с определенного товара 
    let goodsInPort = gameState.goodsInPort;//array
    let name = goodsInPort[index].name;
    let prices = gameState.prices[portId - 1];//СЧИТАЕТ В Н-ОМ ПОРТУ
    return loadAmount(goodsInPort[index]) * prices[name]; 
}
function profitIndex (gameState, portId) {  //выбирает самый выгодный из goodsInPort(домашний порт) ПО ЦЕНАМ ОПРЕДЕЛЕННОГО ПОРТА(ИХ ЖЕ ТАМ НЕСКОЛЬКО)
    let goodsInPort = gameState.goodsInPort;//array
    let profitIndex = 0;
    for (let i = 1; i < goodsInPort.length; i++) {
        if (productProfit(gameState, profitIndex, portId) < productProfit(gameState, i, portId)) {
            profitIndex = i;
        }
    }
    return profitIndex;
}
function isInPort(gameState, home) {//assuming home is in first, home is true
    let ship = gameState.ship;
    let ports = gameState.ports; 
    let startIndex = home ? 0 : 1;
    let endIndex = home ? 1 : ports.length;
    let flag = false;

    for (let port = startIndex; port < endIndex; port++) {
        if (ship.x + 1 == ports[port].x + 1 && ship.y + 1 == ports[port].y + 1) { //+1 padding???
            flag = true;
        }
    }
    return flag;
}
function canLoad(goodsInPort, shipGoods) { //Если корабль попробует загрузить товар, которого нет в домашнем порту, упрощенная версия
    let available = false; //is there stuff to load from the port
    for (let i = 0; i < goodsInPort.length; i++){
        if  (goodsInPort[0].amount > 0) {
            available = true;
        }
    }
    //add later on check if there is space on ship
    return available && shipGoods.length == 0; //load only once shipGoods.length == 0 simple version
}//loadAmount() != 0 rethink this logic !!!!!!!!!!!!!!!!!!!!!
function canSell(shipGoods) {//sell onl if there is something to sell
    return shipGoods.length != 0
}
/*function nearPirates(gameState,nextMove) {//ship's next move

let dx = [1, 0, -1, 0];// смещения, соответствующие соседям ячейки
let dy = [0, 1, 0, -1];//справа, снизу, слева и сверху
let pirates = gameState.pirates;
let x = nextMove.x; 
let y = nextMove.y;
console.log("ship at:" + (gameState.ship.y + 1) + " " + (gameState.ship.x + 1));
console.log("nextMove:" + y + " " + x);
for (let n = 0; n < pirates.length; n++) {
    let pirateX = pirates[n].x + 1; //+1 for padding
    let pirateY = pirates[n].y + 1;
    console.log("k cycle");
    for (let k = 0; k < 4 ; k++) {
        let nextY = y + dy[k];
        let nextX = x + dx[k];
        console.log("next:" + nextY + " " + nextX);
        console.log("pirateY:" + pirateY + " " + pirateX);
        if (nextX == pirateX && nextY == pirateY) {
            //run away
            //check for other pirate too (might be between two pirates)
            console.log("ABOUT TO CRASH INTO A PIRATE AT" +nextY + " " + nextX);
            break; //found only for one pirate, no need to check others in k, check for other pirates
        }
    }
    
}
return;
} */
function nearPirates(gameState) {
    let x = gameState.ship.x + 1; 
    let y = gameState.ship.y + 1;
    console.log("ship at " + y + " " + x);
    let dx = [0, 1, 2, 3, 2, 1, 0, -1, -2, -3, -2, -1];
    let dy = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
    let pirates = gameState.pirates;
    for (let n = 0; n < pirates.length; n++) {
        let pirateX = pirates[n].x + 1; //+1 for padding
        let pirateY = pirates[n].y + 1;
        if (Math.sqrt(Math.pow(((x - 3) - pirateX),2) - Math.pow(y - pirateY,2)) <= 3) { //taking one (the highest possible number) from area distance around ship (3,0)
            //it's within reasonable distance, so i can do a full check
            for (let k = 0; k < dx.length ; k++) {
                let areaY = y + dy[k];
                let areaX = x + dx[k];
                console.log("area:" + areaY + " " + areaX);
                console.log("pirateY:" + pirateY + " " + pirateX);
                if (areaX == pirateX && areaY == pirateY) {
                    //run away
                    console.log("ABOUT TO CRASH INTO A PIRATE AT" + areaY + " " + areaX);
                    return "S";
                    /*if (y < pirateY) {
                        return "S";
                    } else if (y > pirateY || (dy[k] == 0)) {
                        return "N";
                    } else { // на одной из вертикальных осей
                        return "E";
                    }*/
                    break; //found only for one pirate, no need to check others in k, check for other pirates
                }
            }
        }
    }
    //
    return false;
}
function predictPirates(gameState, futureMove){//+2 in future, guranteed right passage
    //in one move pirate is only in one line
    //don't forget padding +1
    //when to start with, predicting the pirates through point or length counting and same line(it may still not pose a threat going vertically when threat is horizontal for example)
    let predictions = [];//тут хранятся направления движения
    let pirates = gameState.pirates;
    
    let pirateX = pirates[0].x + 1;//padding +1
    let pirateY = pirates[0].y + 1;
    let lastPirateX = lastPirateMove[0].x + 1;
    let lastPirateY = lastPirateMove[0].y + 1;
    /*
    let points = gameState.piratesPoints;

    console.table(points);
    for (let j = 0; j < (points[0].length - 1); j++) {//for first pirate
        let px = points[0][j].x + 1;//padding +1
        let py = points[0][j].y + 1;
        if (pirateX == px) {//moves horizontally
            //это j c которой начинается линия, значит пират движется сейчас по этой линии (с разными значениями y)
            if ((pirateY == futureMove.y) && (Math.sqrt(Math.pow((pirateX - futureMove.x),2) - Math.pow((pirateX - futureMove.x),2)) < 4) ) { //pirateX==futureMove.x || 
                //not only moves horizontally, but on same line(y) and close enough to about to collide into ship
                return "WAIT"
            }
        }
        if (pirateY == py) {//moves vertically
            //это j c которой начинается линия, значит пират движется сейчас по этой линии (с разными значениями y)
            if ((pirateX == futureMove.x) && (Math.sqrt(Math.pow((pirateX - futureMove.x),2) - Math.pow((pirateX - futureMove.x),2)) < 4) ) { //pirateX==futureMove.x || 
                //not only moves vertically, but on same column(x) and close enough to about to collide into ship
                return "WAIT"
            }
        }
        //pointsx - other x = direction*/

        //1) horizontal or vertical
        //2)move towards or moves away from futuremove
        let scaredPoints = 5; //lol, change it later to something else!!!!!!!!!!!!!
        let moves = "nothing";
        let towardsFuture = false;
        if (lastPirateX - pirateX != 0) { //something changed 
            moves = "WE"; //horizontally
            console.table(lastPirateMove);
            console.log(Math.abs(futureMove.x - lastPirateX) + " and " + Math.abs(futureMove.x - pirateX));//
            if (Math.abs(futureMove.x - lastPirateX) > Math.abs(futureMove.x - pirateX) ) { // если расстояние было больше, а стало меньше, значит движется в нашу сторону
                towardsFuture = true;
                console.log("i wuz here");
            } 
        }
        /*} else if (lastPirateY - pirateY != 0) {
            moves = "SN";
        }*/
        console.log(moves);
        lastPirateMove = cloneArray(pirates, 1);
        console.table(lastPirateMove);
        console.log(pirateY + " y " + (futureMove.y + 1));
        console.log("pirateX:" + pirateX);
        console.log("futureMove:" + futureMove.x);
        console.log(Math.abs(pirateX - futureMove.x ));
        if ( (towardsFuture) && (moves == "WE") && (pirateY == (futureMove.y )) && ( Math.abs(pirateX - futureMove.x ) < scaredPoints) ) { //pirateX==futureMove.x || 
            //not only moves horizontally, but on same line(y) as future and close enough to about to collide into ship
            console.log("predict wait 1");
            return "WAIT"
        }
        /*if ( (moves == "SN") && (pirateX == futureMove.x) && (Math.sqrt(Math.pow((pirateX - futureMove.x),2) - Math.pow((pirateX - futureMove.x),2)) < scaredPoints) ) { //pirateX==futureMove.x || 
            //not only moves vertically, but on same column(x) as future and close enough to about to collide into ship
            console.log("predict wait 2");
            return "WAIT"
        }*/
    return false;
}

export function getNextCommand(gameState) {
    
    let goodsInPort = gameState.goodsInPort; // goods in the port 
    let  shipGoods = gameState.ship.goods;  //what should go or is on the ship (in first product)
    let last = moveArray.length - 1;
    let ports = gameState.ports;

    if (isInPort(gameState, true)|| isInPort(gameState, false)) {
        if (isInPort(gameState, true) && canLoad(goodsInPort, shipGoods)) {//is in homeport
            let portId; 
            if (gameState.ports.length == 2) {
                portId = 1;//первый порт
            } else {
                portId = bestPort(gameState);
                
            }
            if (bestPortId == -1) {// wasn't before initialized with a new value
                    bestPortId = portId;
                }
            if (moveArray.length == 1) {//все ходы израсходованы
                if (portId != bestPortId) {//there is a new bestport now
                    bestPortId = portId;
                    mapArray = cleanMapArray; // очищаем
                    wave(gameState); //просчитываем до нового порта, getmovearray включено
                    let newArray = mapArray.map(el => el.map(el => el.waveValue));
        console.table(newArray);
        console.table(moveArray);
                } else {
                    moveArray = getMoveArray(ports[portId].y + 1, ports[portId].x + 1); //calculating new route using same wave данные
                } //+1 because of padding //judging by same in wave function OK!
            }
            let i = profitIndex(gameState, portId); //the product index we want to load
            let load = loadAmount(goodsInPort[i])
            return "LOAD " + goodsInPort[i].name + " " + load; 
        } else {
            if  (isInPort(gameState, false) && canSell(shipGoods)) {
                moveArray = getMoveArray(moveArray[last].y, moveArray[last].x).reverse();//calculating new route (to home)
            return "SELL " + shipGoods[0].name + " " + shipGoods[0].amount; //my ship usually contains only one product, so it's in the first array
            }
        } 
    }
    
    if (moveArray.length >= 3) {
        value = predictPirates(gameState,moveArray[last - 2]);
    }
    //value = nearPirates(gameState);
    if (value) {
        let result = value;
        value = false;
         //perhaps to go back to first dot it wastes a move and a last and a pop, so i should make a copy of last move //this is just a bandage, temporary
        //moveArray.push(moveArray[last]);//think about a better way to copy if needed (because of link to obj)
        return result;
    } else {
            moveArray.pop();
            last = moveArray.length - 1;
            if (last == -1) {
                console.log("i'm waiting 1");
                return "WAIT";
                
            }
        if ((gameState.ship.x + 1) > moveArray[last].x) { //+1 for padding
            return "W"
        }
        if ((gameState.ship.x + 1) < moveArray[last].x) {
            return "E";
        }
        if ((gameState.ship.y + 1) > moveArray[last].y) {
            return "N";
        } 
        if ((gameState.ship.y + 1)< moveArray[last].y) {
            return "S";
        }
    }
   /* if (value < 3) {
        value++;
        return "N";
    } else {
        return "WAIT";
    }*/
    console.log("i'm waiting 2");
    return 'WAIT';
    
}
