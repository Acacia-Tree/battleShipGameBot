const shipVolume = 368;//
let currentShipVolume = 0;
let mapArray;
export function startGame(levelMap, gameState) {
    mapArray = levelArray(levelMap);
    console.log(mapArray);
}
function levelArray(levelMap) {
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
            array[i][j] = levelMap[n];
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
function productProfit (gameState, index) {//считает прибыль с определенного товара 
    let goodsInPort = gameState.goodsInPort;//array
    let name = goodsInPort[index].name;
    let prices = gameState.prices[0];
    return loadAmount(goodsInPort[index]) * prices[name]; 
}
function profitIndex (gameState) {  //выбирает самый выгодный
    let goodsInPort = gameState.goodsInPort;//array
    let profitIndex = 0;
    for (let i = 1; i < goodsInPort.length; i++) {
        if (productProfit(gameState, profitIndex) < productProfit(gameState, i)) {
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
    return available && shipGoods.length == 0; //load only once shipGoods.length == 0 simple version
}//loadAmount() != 0 rethink this logic !!!!!!!!!!!!!!!!!!!!!
function canSell(shipGoods) {//sell onl if there is something to sell
    return shipGoods.length != 0
}

function bestPort(gameState) {
    let prices = gameState.prices;
    let maxPrice = prices[0].fabric;
    let maxIndex = 0;
    for (let i = 1; i < prices; i++) {
        if (prices[i].fabric > maxPrice) {
            maxPrice = prices[i].fabric;
            maxIndex = i;
        }
    }
    return prices[maxIndex].portId;  
}


export function getNextCommand(gameState) {
    let goodsInPort = gameState.goodsInPort; // goods in the port 
    let  shipGoods = gameState.ship.goods;  //what should go or is on the ship (in first product)
    
    if (isInPort(gameState, true)) {//is in homeport
        
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
    }
    return 'WAIT';
    
}
