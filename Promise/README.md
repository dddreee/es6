# Promise 对象
## 1. Promise的含义
`Promise` 简单来说是一个容器，里面存储着某个未来才会结束的事件（通常是一个异步操作）的结果。

从语法上说， `Promise` 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

Promise对象的特点：
- 对象的状态不受外界的影响。它有三个状态： `pending`(进行中) , `fulfilled` (已成功) 和 `rejected` (已失败)。只有异步操作的结果可以改变这个状态！

- 一旦状态改变，就不会再变，任何时候都能得到这个结果。Promise对象的状态改变只有两种可能：从 `pending` 到 `fulfilled` 和从 `pending` 到 `rejected` 。只要这两种情况发生，状态就会一直保持这个结果不会再改变了，此种情况被称为 `resolved`。

注意，为了行文方便，本章后面的 `resolved` 统一只指 `fulfilled` 状态，不包含rejected状态。

Promise 也有一些缺点：
- 一旦执行不能中途取消
- 如果不设置回调函数，Promise内部抛出的错误，不会反应到外部
- 当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## 2. 基本用法
```javascript
const promise = new Promise(function(resolve, reject){
    //...some code
    if(true /* 异步操作成功 */ ){
        resolve(value);
    }else{
        reject(err);
    }
});

promise.then(function(value){
    //...success
}, function(err){
    //...failed
});

```
`resolve` 函数是Promise对象状态变成成功时，将异步操作的结果作为参数传递出去;<br>
 `reject` 函数的作用则是才状态变为失败时，将异步操作报出的错误作为参数传递。<br>
`then` 方法可以接受两个回调函数作为参数。第一个回调函数是 Promise 对象的状态变为 `resolved` 时调用，第二个回调函数是 Promise 对象的状态变为 `rejected` 时调用。其中，第二个函数是可选的，不一定要提供。这两个函数都接受 Promise 对象传出的值作为参数。

```javascript
const time = function(ms = 100){
    return new Promise((resolve, reject) => {
        console.log('promise');
        setTimeout(resolve, ms, 'none');
    });
}

time(300).then(value => {
    console.log(value);
});
```
- promise 新建后会立马执行
- then方法指定的回调函数，将在当前脚本所有同步任务执行完才会执行。
```javascript
let promise = new Promise((resolve, reject) => {
    console.log('promise');
    resolve();
});
promise.then(() = > {
    console.log('resolved');
});

console.log('Hi');
// promise
// Hi
// resolved
```

下面是异步加载图片的例子。
```javascript
function loadImageAsync(url){
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = function(){
            resolve(image);
        }

        image.onerror = function(){
            reject(new Error('Could not load image at' + url));
        }
        image.src = url;
    });
}
```
上面代码中，使用Promise包装了一个图片加载的异步操作。如果加载成功，就调用resolve方法，否则就调用reject方法。

下面是一个用Promise对象实现的 Ajax 操作的例子。
```javascript
function getJson(url){
    return new Promise(function(resolve, reject){
        const handle = function(){
            if(this.readyState !== 4){
                return;
            }
            if(this.status === 200){
                resolve(this.)
            }else{
                reject(new Error(this.statusText));
            }
        }
        const client = new xmlHttpRequest();
        client.open('get', url);
        client.onreadystatechange = handle;
        client.responseType = "json";
        client.setRequestHeader("Accept", "application/json");
        client.send();
    });
}

getJSON("/posts.json").then(function(json) {
  console.log('Contents: ' + json);
}, function(error) {
  console.error('出错了', error);
});
```

reject函数常用的参数是Error对象，resolve函数的参数除了正常的值，还有可能是另外一个promise对象。
```javascript
const p1 = new Promise((resolve, reject) => {
    //...
});

const p2 = new Promise((resolve, reject) => {
    resolve(p1);
});
```
 `p2` 的 `resolve` 方法将 `p1` 作为参数，此时 `p1` 的状态会传给 `p2` ，也就是说 `p2` 的状态取决于 `p1` 的状态。如果 `p1` 的状态是 `pending` ，那么 `p2` 的回调函数会等待 `p1` 状态改变；如果 `p1` 的状态已经是 `resolved` 或者 `rejected` ，那么 `p2` 的回调函数会立即执行。
 ```javascript
const p1 = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('fail')), 3000);
});

const p2 = new Promise((resolve, reject) => {
    setTimeout(() => resolve(p1), 1000);
});

p2.then(result => console.log(result)).catch((err) => console.log(err));
 ```

