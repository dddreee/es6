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

## 3. Promise.prototype.then()
`then` 方法第一个参数是 `resolve` 状态调用的回调函数， 第二个参数(可选)是 `reject` 状态调用的回调函数。

`then` 方法返回的是一个**全新的 `promise` 实例**。因此 `then` 之后可以调用另一个 `then` 方法。
```javascript
getJson('./t.json').then(json => {
    return json.post
}).then(post => {
    console.log(post);
    //..
});
```
上面的代码使用 `then` 方法，依次指定了两个回调函数。第一个回调函数完成以后，会将返回结果作为参数，传入第二个回调函数。

采用链式的 `then` ，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个 `Promise` 对象（即有异步操作），这时后一个回调函数，就会等待该 `Promise` 对象的状态发生变化，才会被调用。

```javascript
getJSON("/post/1.json").then(function(post) {
    return getJSON(post.commentURL);
}).then(function funcA(comments) {
    console.log("resolved: ", comments);
}, function funcB(err){
    console.log("rejected: ", err);
});
```

上面代码中，第一个 `then` 方法指定的回调函数，返回的是另一个 `Promise` 对象。这时，第二个 `then` 方法指定的回调函数，就会等待这个新的 `Promise` 对象状态发生变化。如果变为 `resolved` ，就调用 `funcA` ，如果状态变为 `rejected` ，就调用 `funcB` 。

## 4. Promise.prototype.catch()
`Promise.prototype.catch` 方法是 `.then(null, rejection)` 的别名，用于指定发生错误时的回调函数。
1. 如果 `promise` 状态转为 `rejected` ，就会调用 catch 方法

2. `then` 指定的回调函数运行出错，也会被 `catch` 捕获并调用

3. 如果 `Promise` 状态变成 `resolve` ，再抛出错误是无效的

4. `promise` 内部运行出错不会中断影响外部js的运行

5. `Promise` 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个 `catch` 语句捕获。

6. 一般来说，不要在then方法里面定义 `Reject` 状态的回调函数（即then的第二个参数），总是使用 `catch` 方法。

7. `Node` 有一个 `unhandledRejection` 事件，专门监听未捕获的 `reject` 错误，上面的脚本会触发这个事件的监听函数，可以在监听函数里面抛出错误。 `unhandledRejection` 事件的监听函数有两个参数，第一个是错误对象，第二个是报错的 `Promise` 实例，它可以用来了解发生错误的环境信息。

8. 一般总是建议， `Promise` 对象后面要跟 `catch` 方法，这样可以处理 `Promise` 内部发生的错误。 `catch` 方法返回的还是一个 `Promise` 对象，因此后面还可以接着调用 `then` 方法。

9. catch方法之中，还能再抛出错误。

```javascript
//1
getJson('./t.json').then((result) => {
    //...
}).catch((err) => {
     // 处理 getJSON 和 前一个回调函数运行时发生的错误
    console.log(err)
});
//与上面的等同， 不过推荐上面的写法。
getJson('./t.json').then(result => {
    //...
}).then(null, err => {
    console.log(err);
});
//7
process.on('unhandledRejection', function (err, p) {
  throw err;
});

//8.
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};
someAsyncThing()
.catch(function(error) {
  console.log('oh no', error);
})
.then(function(result) {
  console.log('carry on');
  console.log(result);
});
// oh no [ReferenceError: x is not defined]
// carry on

```
## 5. Promise.prototype.finally()
`finally` 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 **`ES2018`** 引入标准的。

不管 `promise` 最后的状态，在执行完 `then` 或 `catch` 指定的回调函数以后，都会执行finally方法指定的回调函数。

 `finally` 方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 Promise 状态到底是 `fulfilled` 还是 `rejected` 。这表明， `finally` 方法里面的操作，应该是与状态无关的，不依赖于 `Promise` 的执行结果。

  `finally` 方法总是会返回原来的值。
```javascript
//finally的实现
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

// resolve 的值是 undefined
Promise.resolve(2).then(() => {}, () => {})

// resolve 的值是 2
Promise.resolve(2).finally(() => {})

// reject 的值是 undefined
Promise.reject(3).then(() => {}, () => {})

// reject 的值是 3
Promise.reject(3).finally(() => {})
```

## 6. Promise.all()
`Promise.all` 方法用于将多个 `Promise` 实例，包装成一个新的 `Promise` 实例。这个方法接受一个数组(或者是具有 `Iterator` 接口,并且每个成员都是 `Promise` 实例)作为参数，数组成员都是 Promise 的实例。
```javascript
const p = Promise.all([p1, p2, p3]);
```

（1）只有`p1、p2、p3`的状态都变成 `fulfilled` ，p的状态才会变成 `fulfilled` ，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。

（2）只要`p1、p2、p3`之中有一个被 `rejected` ，p的状态就变成 `rejected` ，此时第一个被 `reject` 的实例的返回值，会传递给p的回调函数。

注意，如果作为参数的 `Promise` 实例，自己定义了 `catch` 方法，那么它一旦被 `rejected` ，并不会触发 `Promise.all()` 的 `catch` 方法。

执行了 `catch` 方法后返回的新的 `Promise` 实例状态会变为 `fulfilled`

## 7. Promise.race()
