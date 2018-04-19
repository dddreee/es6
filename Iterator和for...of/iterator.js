class Iterator{
    constructor(obj){
        var keys = Reflect.ownKeys(obj);
        var mapArray = [];
        for(let k of keys){
            mapArray.push([k, obj[k]]);
        }

        return mapArray;
    }
}

function objToArray(obj){
    return new Iterator(obj);
}

let obj = {
    a: 1,
    b: 2
}

let map = new Map(objToArray(obj));
console.log(map)