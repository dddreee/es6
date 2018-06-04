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
