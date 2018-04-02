let ms = {};
function getItem(key){
    return ms[key] ? ms[key] : null
}
function setItem(key, value){
    ms[key] = value;
}
module.exports = {getItem, setItem};