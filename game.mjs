const shipVolume = 368;//
let currentShipVolume = 0;
let mapArray = []; // wave перерабатывает это
let cleanMapArray = []; // after leveMap has been called on it and wave hasn't been used on it, and so i don't have to count it again
let moveArray = [{x: null, y: null}]; //путь перемещения
let bestPortId = -1; //this is current bestPort, needed to find out if the bestPort is now another port, in order to know when to recalculate the wave
export function startGame(levelMap, gameState) {
    mapArray = levelArray(levelMap);
    cleanMapArray = cloneArray(mapArray);
    wave(gameState);
    let newArray = mapArray.map(el => el.map(el => el.mapValue));
        console.table(newArray);
        console.table(moveArray);
}
function cloneArray(arr) {//for copying arrays WITH OBJECTS
    var result = [];
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

        let dy = [1, 0, -1, 0];// смещения, соответствующие соседям ячейки !!!!!!!!!!!!!!!!!!!!!! HERE ITS Y, THERE IT'S I, CHANGE LATER FOR ONE CODE STYLE
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

export function getNextCommand(gameState) {
    
    let goodsInPort = gameState.goodsInPort; // goods in the port 
    let  shipGoods = gameState.ship.goods;  //what should go or is on the ship (in first product)
    let last = moveArray.length - 1;
    
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
                    mapArray = cleanMapArray; // очищаем
                    //USING BESTPORTID CLEAN 253
                    wave(gameState); //просчитываем до нового порта, getmovearray включено
                    //TESTTESTTEST
                    let newArray = mapArray.map(el => el.map(el => el.waveValue));
        console.table(newArray);
        console.table(moveArray);
                } else {
                    let ports = gameState.ports;
                    moveArray = getMoveArray(ports[portId].y + 1, ports[portId].x + 1); //calculating new route using same wave данные
                } //+1 because of padding //judging by same in wave function OK!
            }
            let i = profitIndex(gameState, portId); //the product index we want to load
            let load = loadAmount(goodsInPort[i])
            return "LOAD " + goodsInPort[i].name + " " + load; 
        } else if  (isInPort(gameState, false) && canSell(shipGoods)) {
                moveArray = getMoveArray(moveArray[last].y, moveArray[last].x).reverse();//calculating new route (to home)
            return "SELL " + shipGoods[0].name + " " + shipGoods[0].amount; //my ship usually contains only one product, so it's in the first array
        }
    }
    moveArray.pop();
    last = moveArray.length - 1;
    if (last == -1) {
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
    
    
    return 'WAIT';
    
}
