const fn = new Promise((reslove, reject) => {
    reject(0);
});

var p = fn.then(result1 => {
    console.log(`result1: ${ result1 }`);
    return 1;
}, err1 => {
    console.log(`err1: ${ err1 }`);
    return -1;
}).then(result2 => {
    console.log(`result2: ${ result2 }`);
    return 2
}, err2 => {
    console.log(`err2: ${ err2 }`);
    return -2;
}).then(result3 => {
    console.log(`result3: ${result3}`);
    return 3
}, err3 => {
    console.log(`err3: ${err3}`);
    return -3;
}).catch(err4 => {
    console.log(`err4: ${err4}`);
})