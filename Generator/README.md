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


