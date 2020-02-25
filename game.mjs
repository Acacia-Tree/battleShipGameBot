export function startGame(levelMap, gameState) {
    //может тут метод написать
}

export function getNextCommand(gameState) {
    let goodsInPort = gameState.goodsInPort; // goods in the port 
    const shipVolume = 368;//to startGame, const
    let  shipGoods = gameState.ship.goods; //what should go or is on the ship (in first product)
    
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
        console.log(goodsInPort[0].name + " " + productProfit(gameState,0));
        console.log(goodsInPort[1].name + " " + productProfit(gameState,1));
        console.log(goodsInPort[2].name + " " + productProfit(gameState,2));
        console.log(goodsInPort[3].name + " " + productProfit(gameState,3));
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
    function canLoad(goodsInPort) { //Если корабль попробует загрузить товар, которого нет в домашнем порту, упрощенная версия
        let available = false; //is there stuff to load from the port
        for (let i = 0; i < goodsInPort.length; i++){
            if  (goodsInPort[0].amount > 0) {
                available = true;
            }
        }
        return available && shipGoods.length == 0; //load only once shipGoods.length == 0 simple version
    }//loadAmount() != 0 rethink this logic !!!!!!!!!!!!!!!!!!!!!
    function canSell() {//sell onl if there is something to sell
        return shipGoods.length != 0
    }
    function steer() {//where
        if (isInPort(gameState, true)) {//is in homeport
            
            if (canLoad(goodsInPort)){
                let i = profitIndex(gameState);
                console.log(i)
                //let i = 0;
                return "LOAD " + goodsInPort[i].name + " " + loadAmount(goodsInPort[i]); //
            }
        }
       /* if (!isInPort(gameState, false)) {//not in homeport and not in otherport
            if (canSell()) {
                return "N";
            } else {
                return "S"
            }
            
        }
        if(isInPort(gameState,false)) {//is in otherport
            if (canSell()) { 
                return "SELL " + shipGoods[0].name + " " + shipGoods[0].amount;
            }
            return "S";
        }*/
        if (canSell()) {
            if (isInPort(gameState, false)) {
                return "SELL " + shipGoods[0].name + " " + shipGoods[0].amount; //my ship usually contains only one product, so it's in the first array
            } else {
                return "N";
            }
        } else {
            return "S";
        }
        return 'WAIT';
    }

    return steer();
    
}
