# Generator 函数

## 1. 简介
- Generator 函数是一个状态机，封装了多个内部状态。
- 执行 Generator 函数返回一个遍历器对象。 除了是一个状态机，还是一个遍历器生成函数

在形式上，有两个特征：1. `function` 关键词与函数名之间有 `*` 号； 2. 函数体内有 yield 表达式， 定义不同的内部状态。

```javascript
function* createGenerator(){
    yield 'hello';
    yield 'world';
    return 'ending';
}
let fn = createGenerator();

fn.next();//{value: 'hello', done: false}
fn.next();//{value: 'world', done: false}
fn.next();//{value: 'ending', done: true}
fn.next();//{value: 'undefined', done: true}

```
共调用了4次next方法

- 第一次, `Generator` 函数开始执行，到第一个 `yield` 表达式为止， `next` 方法返回一个对象， 对象的 value 属性是 `yield` 表达式返回的值。此时 `done` 属性是 `false` ，遍历还没结束
- 第二次从第一个 `yield` 开始到第二个 `yield` 表达式位置，重复上一次的操作
- 第三次遇到了 `return` 表达式， 返回的对象的 `value` 是 `return` 的值，并且结束遍历， `done` 属性为 `true` 。 `return` 的值是函数，value的值也是函数，并不会计算函数的返回值什么的。 如果没有 `return` 表达式，函数会一直遍历到结束 并返回 `{value: undefined, done: true}`
- 第四次，此时遍历已经结束了，就返回了  `{value: undefined, done: true}`

### yield 表达式
由于 `Generator` 函数返回的是遍历器对象，只有调用 `next` 方法才会遍历下一个内部状态，所以这个函数提供一个暂停的方法，暂停的节点就是 `yield` 表达式

- 遇到 `yield` 表达式，会暂停后面的执行，并且将 yield 后面的表达式的值作为返回值的 `value` 属性值。

- 下一次调用 `next` 方法时，再往下执行, 直到遇到新的 `yield` 表达式

- 如果没有遇到新的表达式， 就会一直运行到结束，直到 `return` 语句为止，并将 `return` 的值作为返回对象的 `value` 属性值。

- 如果没有 `return` 语句， 会返回 `undefined` 。

需要注意的是， `yield` 后面跟的表达式是惰性求值，只有当 `next` 方法指向当前 `yield` 时，才会执行表达式，并返回结果。

`yield` 只能在 `Generator` 函数中使用, 其他地方会报错。

`yield` 在另一个表达式中必须放在括号中，否则会报错
```javascript
function* demo(){
    console.log('Hello' + yield); // SyntaxError
    console.log('Hello' + yield 123); // SyntaxError

    console.log('Hello' + (yield)); // OK
    console.log('Hello' + (yield 123)); // OK
}
```

yield表达式用作函数参数或放在赋值表达式的右边，可以不加括号。

```javascript
function* demo(){
    foo(yield 123, yield 234); //ok
    let input = yield; //ok
}
```

### 与 Iterator 接口的关系
任意一个对象的 `Symbol.iterator` 方法，等于该对象的遍历器生成函数，调用该函数

由于 Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的Symbol.iterator属性，从而使得该对象具有 Iterator 接口。

Generator 函数执行后，会返回一个遍历器对象，遍历器对象的 `Symbol.iterator` 属性执行后返回本身。
```javascript
function* gen(){

}
let g = gen();
g[Symbol.iterator]() === g; //true
```

## 2. next 方法的参数
yield 表达式没有返回值，或者说总是返回 undefined。 next方法可以带一个参数，该参数会被当作上一个yield表达式的返回值
```javascript
function* f(){
    for(var i = 0; true; i++){
        var reset = yield i;
        if(reset){
            i = -1;
        }
    }
}
var g = f();
g.next(); //{value: 0, done: false}
g.next(); //{value: 1, done: false}
g.next(true); //{value: 0, done: false}
```
如果 next 方法没传入 true， 那么 yield 表达式每次都是返回的 undefined的，知道传入了true，那么变量 reset 的值就变为 true，因此 i = -1；下次循环 i 会从 -1 开始递增。

## 3. for...of循环

```javascript
function* foo(){
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
    return 6;
}

for(let v of foo()){
    console.log(v);
}
//1,2,3,4,5
```
for...of 循环，一次显示5个 yield 表达式的值。一旦 next 方法的返回对象中的 done 属性为 true , for...of 循环就会终止，且不包含该返回对象， 因此上面return 语句的返回的6不包括在 for...of 循环中。

下面是一个利用 Generator 函数和 for...of 循环
```javascript
function* fibonacci(){
    let [prev, curr] = [0, 1];
    for(;;){
        yield curr;
        [prev, curr] = [curr, prev + curr]
    }
    // return curr;
}
for(let n of fibonacci()){
    if(n > 1000) break;
    console.log(n);
}
```
for...of ， ... 和 Array.from 都是调用遍历器接口。因此都能将Generator函数返回的Iterator对象，作为参数
```javascript
function* numbers(){
    yield 1;
    yield 2;
    return 3;
    yield 4;
}
[...numbers()]; //[1,2]

for(let n of numbers){
    console.log(n)
};
//1
//2

let [x, y] = numbers();
//x = 1, y = 2
```

## Generator.prototype.throw()
Generator 函数返回的遍历器对象，都有一个 throw 方法，可以在函数体外抛出错误，然后再 Generator 函数体内捕获
```javascript
var g = function* () {
    try{
        yield;
    }catch(e){
        console.log('内部捕获', e);
    }
}

var i = g();
i.next();

try{
    i.throw('a');
    i.throw('b');
}catch(e){
    console.log('外部捕获', e);
}

//内部捕获a
//外部捕获b
```
上面的代码，连续抛出两次错误。第一次错误被 Generator 函数体内的 catch 捕获，**Generator函数内部的 catch 语句已经执行过了，不会再捕捉这个错误了，因此被函数体外的 catch 语句捕获了**

throw 方法接受一个参数，这个参数会被 catch 语句接收，建议抛出 error 实例。
命令不同。
遍历器对象的 throw 方法和全局的 throw 

```javascript
try {
  throw new Error('a');
  throw new Error('b');
} catch (e) {
  console.log('外部捕获', e);
}
// 外部捕获 [Error: a]
```
一旦抛出了错误，try代码块中后面的代码就不会执行了。

```javascript
var g = function* () {
  while (true) {
    yield;
    console.log('内部捕获', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('外部捕获', e);
}
// 外部捕获 a
```
上述代码，因为 Generator 函数中没有部署 try...catch代码块，因此抛出的错误被外部的catch代码块捕获。

如果 Generator 函数内部和外部都没有部署 try...catch 代码块，抛出错误将导致程序报错并且中断执行

throw 方法抛出的错误要被内部捕获，前提是必须至少执行过一次 next 方法。

Generator 函数体内抛出的错误，也能被函数体外的 catch 捕获。

一旦 Generator 执行过程中抛出错误，但是没被内部捕获，就不会执行下去。如果还调用了 next 方法，将返回一个 value 值是 undefined 、 done 属性是 true 的对象。js引擎认为 Generator 函数已经遍历结束了。

## 5. Generator.prototype.retur()
Generator 函数返回的遍历器对象，有一个 return 方法，可以返回给定的值，并且**终结 Generator 函数**。
```javascript
function* gen(){
    yield 1;
    yield 2;
    yield 3;
}

var g = gen();
g.next();           //{ value: 1, done: false }
g.return('foo');    //{ value: 'foo', done: true }
g.next();

```
遍历器对象g调用return 方法后，返回值的value属性就是 return 方法的参数 foo。 并且 Generator 函数就终止了， 返回 done 属性为true， 以后再调用 next 方法， done 属性总是返回true。

如果 return 方法不传参数，那么返回的 value 是 undefined

如果 Generator 函数内部有 try...finally 代码块， return 方法会推出到 finally 代码块执行完再执行。

```javascript
function * numbers(){
    yield 1;
    try{
        yield 2;
        yield 3;
    }finally{
        yield 4;
        yield 5;
    }
    yield 6;
}

var g = numbers();
g.next() // { value: 1, done: false }
g.next() // { value: 2, done: false }
g.return(7) // { value: 4, done: false }
g.next() // { value: 5, done: false }
g.next() // { value: 7, done: true }
```
## 6.next() 、 throw() 、 return()的共同点
next() , throw() , return() 这三个方法本质上都是让 Generator 函数回复执行，并且使用不同的语句替换 yield 表达式。

- next() 是将yield 表达式替换成一个值
- throw() 是将yield 表达式变成一个 throw 语句
- return() 是将yield 表达式变成一个 return 语句

## 7. yield* 表达式
如果要在 Generator 函数内部，调用另一个 Generator 函数，就需要用到 yield* 表达式。
```javascript
function* bar(){
    yield 'x';
    yield* foo();
    yield 'y';
}

function* foo(){
    yield 'a';
    yield 'b';
}

//上面等同于
// 等同于
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}
//以及等同于
function* bar() {
  yield 'x';
  for (let v of foo()) {
    yield v;
  }
  yield 'y';
}
```

## 8.作为对象的属性的Generator 函数
```javascript
let obj = {
    *myGenerator(){
        //...
    }
}
//等同于
let obj = {
    myGenerator: function*(){

    }
}
```

## 9.Generator 函数的this
Generator 函数总是返回一个遍历器，es6 规定这个遍历器是 Generator 函数的实例，继承 Generator 函数 prototype 对象上的方法

```javascript
function* g(){

}
g.prototype.hello = function(){
    return 'hi'
}
let obj = g()
obj instanceof g;//true
obj.hello(); // 'hi'
```
Generator 函数返回的遍历器对象，只继承函数的 prototype 对象，并不能当成构造函数使用。

Generator 函数不能跟 new 命令一起用，会报错

有个变通的方法，能让 Generator 函数返回一个正常的对象实例， 既可以使用 next 方法，有能获取正常的 this。 先生成一个空对象，使用 call 方法绑定 Generator 函数内部的 this 。 再调用构造函数之后， 这个空对象就是 Generator 函数的实例对象。
```javascript
function* F(){
    this.a = 1;
    yield this.b = 2;
    yield this.c = 3;
}
var obj = {};
var f = F.call(obj)

f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}

obj.a // 1
obj.b // 2
obj.c // 3
```
 下面的感觉不会用到，不写了。。


 ## 10.含义

 ### Generator 与状态机
 Generator 是实现状态机的最佳结构。
 ```javascript
var ticking = true;
var clock = function(){
    if(ticking){
        console.log('Tick!')
    }else{
        console.log('Tock!')
    }
    ticking = !ticking
}
 ```
每运行一次，状态就改变一次，可以用 Generator 函数实现
```javascript
var clock = function* () {
    while (true) {
        console.log('Tick!')
        yield;
        console.log('Tock!')
        yield;
    }
}
```
Generator 实现与 ES5 相比， 少了保存状态的变量 ticking， 更安全(状态不会被非法篡改)。 Generator 之所以能不用外部变量保存状态，因为它本身就包含了一个状态信息，即目前是否处于暂停状态。

### Generator 与协程
#### (1). 协程与子例程的差异
传统的“子例程”采用堆栈式的“后进先出”的执行方式，只有当调用的子函数完全执行完毕，才会结束执行父函数。协程则不同，多个线程(单线程情况下，即多个函数)可以并行执行，但是只有一个线程(或函数)处于正在运行的状态，其他线程(或函数)都处于暂停状态，线程(或函数)之间可以交换执行权。也就是说，一个线程(或者函数)执行到一般，可以暂停执行，将执行权交给另一个线程(或函数)，等到稍后回收执行权的时候，再恢复执行。这种可以并行执行，交换执行权的线程(或函数)，就称为协程。

从实现上看，再内存中，子例程只使用一个栈，而协程是同时存在多个栈，但只有一个栈是运行状态，也就是说，协程是以多占用内存为代价，实现多任务的并行。

#### (2). 协程与普通线程的差异
不难看出，协程适用于多任务运行的环境。在这个意义上，它与普通的线程很相似，都有自己的执行上下文，可以分享全局变量。它们的不同指出在于，同意时间可以有多个线程处于运行状态，但是运行的协程只能有一个，其他协程都处于暂停状态。此外，普通的线程是抢先式的，到底哪个线程优先得到资源，必须有运行环境决定，但是协程是合作式的，执行权由协程自己分配。

由于JavaScript 是单线程语言，只能保持一个调用栈。引入协程以后，每个任务可以保持自己的调用栈，这样做的最大好处，就是抛出错误的时候，可以找到原始的调用栈，不至于像异步操作的回掉函数那样，一旦出错，原始的调用栈就结束 

Generator 函数是ES6 对协程的实现，但属于不完全实现。Generator 函数被称为 "半协程", 意思只有 Generator 函数的调用者，才能将程序的执行权还给 Generator 函数。 如果是完全执行的协程，任何函数都可以让暂停的协程继续执行。

如果将 Generator 函数当作协程，完全可以将多个需要互相写作的任务协程Generator 函数，他们之间使用yield 表达式交换控制权。

### Generator 与上下文

JavaScript代码运行时，会产生一个全局的上下文环境(context，又称运行环境)，包含了当前所有的变量和对象，然后，执行函数(或块级代码)的时候，又会在当前上下文环境的商城，产生一个函数运行的上下文，变成当前(active)的上下文，由此形成一个上下文环境的堆栈(context stack)。

这个堆栈是"后进先出"的数据结构，最后产生的上下文环境首先执行完成，推出堆栈，然后再执行完成它下层的上下文，直至所有代码执行完成，堆栈清空。

Generator 函数不是这样，它执行产生的上下文环境，一旦遇到yield 命令，就会暂时推出堆栈，但是并不消失，里面所有的变量和对象都会冻结再当前状态，等到对它执行 next 命令时，这个上下文环境又会重新加入调用栈，冻结的变量和对象恢复执行。

```javascript
function* gen(){
    yield 1;
    return 2;
}
let g = gen();
console.log(
    g.next().value,
    g.next().value,
)
```
上面代码中，第一次执行g.next()时，Generator 函数gen的上下文会加入堆栈，即开始运行gen内部的代码。等遇到yield 1时，gen上下文退出堆栈，内部状态冻结。第二次执行g.next()时，gen上下文重新加入堆栈，变成当前的上下文，重新恢复执行。

## 11.应用
### (1)异步操作的同步化表达
```javascript

function* loadUI(){
    showLoadingScreen();
    yield loadUIDataAsynchronously();
    hideLoadingScreen();
}
var loader = loadUI();
//加载ui
loader.next();

//卸载ui
loader.next();
```

### (2)控制流管理
如果一个多布操作非常耗时，采用回调函数
```javascript
step1(function (value1) {
  step2(value1, function(value2) {
    step3(value2, function(value3) {
      step4(value3, function(value4) {
        // Do something with value4
      });
    });
  });
});
```

采用 Promise 改写
```javascript
Promise.resolve(step1)
    .then(step2)
    .then(step3)
    .then(step4)
    .then(value4 => {

    }, err => {

    }).done();
```

用 Generator 进一步改善代码
```javascript
function* longRunningTast(value1){
    try{
        var value2 = yield step1(value);
        var value3 = yield step2(value1);
        var value4 = yield step3(value3);
        var value5 = yield step4(value4);
    }
}

function scheduler(task){
    var taskObj = task.next(task.value);
    if(!taskObj){
        task.value = taskObj.value;
        return scheduler(task)
    }
}
scheduler(longRunningTast(initialValue))
```

还可以用 for...of 循环
```javascript

let steps = [step1Func, step2Func, step3Func]

function* iterateSteps(steps){
  for (var i=0; i< steps.length; i++){
    var step = steps[i];
    yield step();
  }
}

let jobs = [job1, job2, job3];

function* iterateJobs(jobs){
  for (var i=0; i< jobs.length; i++){
    var job = jobs[i];
    yield* iterateSteps(job.steps);
  }
}

for (var step of iterateJobs(jobs)){
  console.log(step.id);
}
```
上面代码中，数组steps封装了一个任务的多个步骤，Generator 函数iterateSteps则是依次为这些步骤加上yield命令。

最后，就可以用for...of循环一次性依次执行所有任务的所有步骤。

再次提醒，上面的做法只能用于所有步骤都是同步操作的情况，不能有异步操作的步骤。如果想要依次执行异步的步骤，必须使用后面的《异步操作》一章介绍的方法。

### (3) 部署 Iterator 接口
利用 Generator 函数，可以在任意对象上部署 Iterator 接口。
```javascript

function* iterEntries(obj) {
  let keys = Object.keys(obj);
  for (let i=0; i < keys.length; i++) {
    let key = keys[i];
    yield [key, obj[key]];
  }
}

let myObj = { foo: 3, bar: 7 };

for (let [key, value] of iterEntries(myObj)) {
  console.log(key, value);
}

```

### (4). 作为数据结构
Generator 可以看作时数据结构，因为Generator函数可以返回一系列的值，这意味着它可以对任意表达式，提供类似数组的接口
```javascript
function* doStuff(){
    yield fs.readFile.bind(null, 'hello.txt');
    yield fs.readFile.bind(null, 'world.txt');
    yield fs.readFile.bind(null, 'and-such.txt');
}

for (let task of doStuff()) {
  // task是一个函数，可以像回调函数那样使用它
}
```

使用es5用数组模拟Genrator
```javascript
function doStuff(){
    return [
        fs.readFile.bind(null, 'hello.txt'),
        fs.readFile.bind(null, 'world.txt'),
        fs.readFile.bind(null, 'and-such.txt')
    ];
}
```