const shipVolume = 368;//
let currentShipVolume = 0;
let mapArray;
let moveArray = [{x: null, y: null}]; //путь перемещения
export function startGame(levelMap, gameState) {
    mapArray = levelArray(levelMap);
    console.log(mapArray);
    //mapArray[gameState.ship.y][gameState.ship.x].waveValue = 0; //конечная точка
    wave(gameState);
        let newArray = mapArray.map(el => el.map(el => el.waveValue));
        console.table(newArray);
        /*for (let i = 0; i < moveArray.length; i++) {
            console.log("x:" + moveArray.x + " " + "y:" + moveArray.y);
        }*/
        console.table("start:" + moveArray);
}
function getMoveArray(yStart, xStart) { //does it write it down normally? sometimes it works as expected, sometimes it's array islonger than needed, usually when i press startgame two times in a row, same level
    //when i refresh before each start it works as expected, perhaps this is because of my globals not refreshing each time. i should initialize them in startGame and put them in classes
    moveArray[0] = {x: xStart, y: yStart};
    let lastIndex = moveArray.length - 1;
    let minWaveValue = 253;
    let minX = -1; // not really used
    let minY = -1;
    let count = 0; //make sure it doesn't do too much
    while (minWaveValue != 0 && count < 20) { //until we reach the end point (which will be in the last array element)
        let x = moveArray[lastIndex].x;
        let y = moveArray[lastIndex].y;
        if ((y + 1 < mapArray.length) && mapArray[y + 1][x].waveValue < minWaveValue ) {
            minWaveValue = mapArray[y + 1][x].waveValue;
            minY = y + 1;
            minX = x;
        }
        if ( (y - 1 >= 0) && mapArray[y - 1][x].waveValue < minWaveValue) {
            minWaveValue = mapArray[y - 1][x].waveValue;
            minY = y - 1;
            minX = x;
        }
        if ((x + 1 < mapArray[0].length) && mapArray[y][x + 1].waveValue < minWaveValue) {
            minWaveValue = mapArray[y][x + 1].waveValue
            minY = y;
            minX = x + 1;
        }
        if ( (x - 1 >= 0) && mapArray[y][x - 1].waveValue < minWaveValue) {
            minWaveValue = mapArray[y][x - 1].waveValue;
            minY = y;
            minX = x - 1;
        }
        moveArray.push({x: minX, y: minY});
        lastIndex = moveArray.length - 1;
        //console.log("minWaveValue:" +minWaveValue);
        //console.log(moveArray[lastIndex]);
        count++;
    } 
    return moveArray;
}
function bestPort(gameState) { //does it show the best port?
   /* let prices = gameState.prices;
    let ports = gameState.ports;
    let maxPrice = prices[0].fabric;
    let maxIndex = 0;
    for (let i = 1; i < prices; i++) {
        if (prices[i].fabric > maxPrice) {
            maxPrice = prices[i].fabric;
            maxIndex = i;
        }
    }
    let bestId = prices[maxIndex].portId;*/
    let ports = gameState.ports;
    let prices = gameState.prices;
    let goods = gameState.goodsInPort;
    let maxPrice = 0;
    let bestGoodsIndex = -1;
    let bestPortIndex = -1;
    for (let i = 0; i < ports.length; i++) {
        let currentGoodsIndex = profitIndex(gameState, i);
        if (currentGoodsIndex > maxPrice) {
            maxPrice = productProfit(gameState, currentGoodsIndex, i);
            console.log("yooo" +maxPrice);
            bestGoodsIndex = currentGoodsIndex;
            bestPortIndex = i;
        }
    }
    console.log("oh" + bestGoodsIndex);
    return ports[bestPortIndex];  
}

function wave(gameState) {
    let Ni = 0; //счетчик итераций, повторений
    let Nk = 64; //максимальное возможное число итераций от балды
    //let xFinish = 14; //for level 3
   //let yFinish = 14;
   let finish = bestPort(gameState);
   console.log("huh" + finish);
   let xFinish = finish.x; 
   let yFinish = finish.y;
    console.log("xfin" + xFinish +"yfin" +yFinish)
    mapArray[yFinish][xFinish].waveValue = 253; //стартовая точка
    mapArray[gameState.ship.y][gameState.ship.x].waveValue = 0; //конечная точка
    while (Ni <= Nk) {
        for (let i = 1; i < mapArray.length - 1; i++) { //c 1 и -1 чтобы не учитывать граничные значения пока
            for (let j = 1; j < mapArray[i].length - 1; j++) {//c 1 и -1 чтобы не учитывать граничные значения пока
                if (mapArray[i][j].waveValue == Ni) {
                    if (mapArray[i + 1][j].waveValue == 253) {
                        getMoveArray(i + 1, j);
                        return true;
                    } 
                    if ( mapArray[i - 1][j].waveValue == 253) {
                        getMoveArray(i - 1, j);
                        return true;
                    } 
                    if (mapArray[i][j + 1].waveValue == 253) {
                        getMoveArray(i, j + 1);
                        return true;
                    } 
                    if (mapArray[i][j - 1].waveValue == 253) {
                        getMoveArray(i, j - 1);
                        return true;
                        //10 Пункт
                    } 
                    if (mapArray[i + 1][j].waveValue == 254) {
                        mapArray[i + 1][j].waveValue = Ni + 1;
                    } 
                    if (mapArray[i - 1][j].waveValue == 254) {
                        mapArray[i - 1][j].waveValue = Ni + 1;
                    } 
                    if (mapArray[i][j + 1].waveValue == 254) {
                        mapArray[i][j + 1].waveValue = Ni + 1;
                     } 
                     if (mapArray[i][j - 1].waveValue == 254)  {
                        mapArray[i][j - 1].waveValue = Ni + 1;
                     }
                }
            }
        }
        Ni++;
    } 
    if (Ni > Nk) {
        return false;//поиск маршрута неудачное
    } else {
        return true;
    }
}
function levelArray(levelMap) { // без стартовой точки, конечной точки;
    let array = [[]];
    let n = 0;
    let i = 0;
    let j = 0;
    while (n != levelMap.length) {
        if (levelMap[n] == '\n') {
            j = 0;
            i++;
            array.push([]);
        } else if (levelMap[n] != ` `) {
            let waveValue;
            if (levelMap[n] == '#') {
                waveValue = 255; //непроходимо
            } else if (levelMap[n] == '~' || levelMap[n] == 'H' || levelMap[n] == 'O' ) {
                waveValue = 254; //проходимо
            } /*else if (levelMap[n] == 'H') {
                waveValue = 252; //проходимо
            } else if (levelMap[n] == 'O') {
                waveValue = 251; //проходимо
            } */
            array[i][j] = {mapValue: levelMap[n], waveValue: waveValue};
            j++
        }
        n++
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
    let prices = gameState.prices[portId];//СЧИТАЕТ В Н-ОМ ПОРТУ
    console.log(name + "is" + loadAmount(goodsInPort[index]) * prices[name])
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
    console.log("well");
    return profitIndex;
}
function isInPort(gameState, home) {//assuming home is in first, home is true
    let ship = gameState.ship;
    let ports = gameState.ports; 
    let startIndex = home ? 0 : 1;
    let endIndex = home ? 1 : ports.length;
    let flag = false;

    for (let port = startIndex; port < endIndex; port++) {
        if (ship.x == ports[port].x && ship.y == ports[port].y) {
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
            let portId = 1; //первый порт
            if (gameState.ports.length > 1) {
                portId = bestPort(gameState);
                
            }
            if (moveArray.length == 1) {
                moveArray = getMoveArray(portId.y, portId.x); //calculating new route
                console.log(moveArray);
                //this is without recalculating the wave, don't forget
            }
            let i = profitIndex(gameState, portId); //the product index we want to load
            let load = loadAmount(goodsInPort[i])
            return "LOAD " + goodsInPort[i].name + " " + load; 
        } else if  (isInPort(gameState, false) && canSell(shipGoods)) {
                moveArray = getMoveArray(moveArray[last].y, moveArray[last].x).reverse();//calculating new route
                console.table(moveArray);
                console.log('im in port');
            return "SELL " + shipGoods[0].name + " " + shipGoods[0].amount; //my ship usually contains only one product, so it's in the first array
        }
    }
    moveArray.pop();
    last = moveArray.length - 1;
    if (last == -1) {
        return "WAIT";
    }
    console.log("last^" + last);
    console.table("movearray:" + moveArray[last].x + " " + moveArray[last].y);
    console.log("ship:" + gameState.ship.x + " " + gameState.ship.y);
    
    if (gameState.ship.x > moveArray[last].x) {
        console.log("W");
        return "W"
    }
    if (gameState.ship.x < moveArray[last].x) {
        console.log("E");
        return "E";
    }
    if (gameState.ship.y > moveArray[last].y) {
        console.log("N");
        return "N";
    } 
    if (gameState.ship.y < moveArray[last].y) {
        console.log("S");
        return "S";
    }
    /*if (isInPort(gameState, true)) {//is in homeport
        
        if (canLoad(goodsInPort, shipGoods)){
            let i = profitIndex(gameState);
            let load = loadAmount(goodsInPort[i])
           // console.log(goodsInPort[i].volume * load);//working with volume
           //currentShipVolume
            return "LOAD " + goodsInPort[i].name + " " + load; //
        }
    }
    if (canSell(shipGoods)) {
        if (isInPort(gameState, false)) {
            //console.log(goodsInPort.volume * shipGoods[0].amount); Хотя зачем считать volume, если все равно все продадится и будет 0

            return "SELL " + shipGoods[0].name + " " + shipGoods[0].amount; //my ship usually contains only one product, so it's in the first array
        } else {
            return "N";
        }
    } else {
        return "S";
    }*/
    return 'WAIT';
    
}
