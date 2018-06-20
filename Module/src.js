let ms = {
    name: 'Test'
};
function getItem(key){
    console.log(ms)
    return ms[key] ? ms[key] : null
}
function setItem(key, value){
    console.log(ms)
    ms[key] = value;
}

module.exports = { getItem, setItem }
// export {getItem, setItem};