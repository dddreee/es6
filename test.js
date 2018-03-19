// 深拷贝
function copyObj(obj){
    var handle = function(source, target){
        for(var k in source){
            if(source[k] instanceof Object){
                if(Object.prototype.toString.call(source[k]) === '[object Array]'){
                    target[k] = [];
                }else{
                    target[k] = {};
                }
            
                handle(source[k], target[k]);
            }else{
                target[k] = source[k];
            }
        }
        return target
    }
    return handle(obj, {});
}

var fn = {
    b: {
        c: () => {
            console.log(1);
            console.log(this);
        }
    }
}

fn.b.c();

Number.prototype.toFixed = function(length){
    var multi = Math.pow(10, length);
    return Math.round(this*multi)/multi;
}
