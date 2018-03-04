# 函数的扩展

## 函数参数的默认值
### 基本用法
与ES5不同，ES6可以给参数添加默认值，省去了`y = y || 'default'`这类代码。需要注意的是，参数变量是默认声明的，不能用`let`和`const`重复声明；使用参数默认值时，参数中不允许存在相同变量；
```javascript
function Fn(x = 1, y = 2){
    this.x = x;
    this.y = y;
}
let f = new Fn();//{x: 1, y: 2}

// 不能做作用域中重复声明
function f(x = 1){
    let x = 1;//报错
    const x = 2;//报错
}

// 使用参数默认值，不允许存在相同变量
function f2(x, x, y){//正常运行
    ...
}
function f3(x, x , y = 1){//报错
    ...
}
```

值得一提的是，参数默认值不是传值得，而是每次重新计算表达式的值。
```javascript
let n = 99
function f(p = n + 1){
    console.log(p);
}
f(); //100

n = 100;
f();//101
```
***
### 与解构赋值的结合
见解构赋值

---
### 参数默认值的位置
一般定义默认值的参数都是尾参数，如果不是尾部的参数设置默认值，那么这个参数是不能省略的，必须填入`undefined`来触发默认赋值操作。
```javascript
function f(x = 1, y){
    return [x, y]
}

f(1); //[1, undefined]
f(, 2); //报错
f(undefined, 2); //[1, 2]
f(null, 2); //[null, 2]
```
---
### 函数的`length`属性
正常情况下，函数的`length`属性返回参数的个数，当指定了默认值后，`length`属性将返回没有指定默认值的参数个数。
```javascript
(function (a, b){}).length; //2
(function (a, b = 2){}).length; //1
```

`length`属性的含义是函数预期传入的参数个数，后文的`rest`参数同理不会计入`length`属性。另外，如果设置了默认值的参数不是尾参数，那么后面的参数将不计入`length`属性。
```javascript
(function (...args){}).length // 0
(function(x, y = 1, z){}).length; //1
```
---
### 作用域
一旦设置了参数的默认值，函数声明在初始化时，参数会形成一个单独的作用域，初始化结束时，这个作用域就会消失。这种语法行为只在设置参数默认值时会出现。
```javascript
let x = 1;
function f(x, y = x){
    console.log(y);
}
f(2); //2
```
上面的代码，在调用函数`f(2)`时，参数形成了一个单独的作用域，参数内部的`x`赋值时2，`y = x`中的x指向的是参数内部的x。

函数默认值如果是一个变量，并且这个变量在函数外部不存在，那么就会报错。
```javascript
let x = 1;
function f(y = x){
    console.log(y);
}
f(); //1
f(2); //2

function f2(a = b){
    console.log(a);
}
f2(); // 报错
```

因为`暂时性死去`的特性，`function(x = x){}`这种写法也会报错。
***
### 应用
***
### rest参数
ES6引入了`rest`参数（形式为`...变量名`）,用于获取多余参数。rest参数对应的是一个数组，多余的参数都在这个数组中。
```javascript
// es5写法
function sortNum(){
    return Array.prototype.slice.call(arguments).sort();
}

// rest
const sortNum = (...numbers) =>  return numbers.sort();
```

### 严格模式
ES2016规定，只要函数参数使用了默认值、解构赋值或者扩展运算符,那么函数内部不能显式设定为严格模式。
```javascript
// 以下几种情况都会报错
function doSomething(a, b = a){
    'use strict';
}

const doSomething = function({a, b}){
    'use strict';
}

const doSomething = (...a) => {
    'use strict';
}

const obj = {
    doSomething({a, b}){
        'use strict';
    }
}
```

这样规定是因为函数内部的严格模式同时适用于函数体和函数参数。但是函数执行的时候，先执行的函数参数，这样就出现一个问题，只有在函数内部才知道参数是否按严格模式执行，但是参数先于函数体执行的。



规避这种限制有两种方式：1、全局声明严格模式； 2、把函数包在一个立即执行的函数中。
```javascript
'use strict';
function a(y = 1){

}

// 或者
var doSomething = (function(){
    'use strict';
    return function(value = 40){
        return value;
    }
}())
```

### name属性
函数的`name`属性其实早就存在，只是到了ES6才写入标准。

***
## 箭头函数
### 基本用法
 ```javascript
var a = num => num;

// 等同于
var a = function(num){
    return num;
}
 ```

如果箭头函数不需要参数或者需要多个参数，可以用圆括号代表参数部分。
```javascript
var f = () => 5;
// 等同于
var f = function(){ return 5 };

var sum = (n1, n2) => n1 + n2;
// 等同于
var sum = function(n1, n2){
    return n1 + n2;
}

```
如果箭头函数的代码块部分多于一条语句，需要使用大括号将代码包裹住，并用`return`语句返回。如果返回的值是对象，可用括号扩住，或者用大括号扩住并用return返回。
```javascript
var sum = (n1, n2) => {return n1 + n2};

var obj = id => {id: id, name: 'a'}; //报错
var obj = id => ({id: id, name: 'a'});//不报错
var obj = id => {return {id: id, name: 'a'}};//不报错
```
箭头函数可以和解构赋值结合
```javascript
var fn = ({x = 1, y = 2} ={}) => {return x + y};
```

箭头函数可以简化表达式，简化回调函数。
```javascript
const isEven = n => n % 2 == 0;
const square = n => n * n;
[1,2,3].map(x => x*2); //[2,4,6]
```

### 使用注意点
**函数体内的`this`对象,就是定义时所在的对象,不是使用时的对象**

**不可以当做构造函数,不能使用`new`命令，否则会报错**

**不可以使用`arguments`对象，在函数体内不存在,可以用`rest`参数替代**

**不可以使用`yield`命令，因此箭头函数不能用作 Generator 函数**

在箭头函数中this指向是固定的。
```javascript
function foo(){
    setTimeout(() => {
        console.log('id:' + this.id);
    }, 100);
}

let id = 16;
foo.call({id: 43});
//id: 43
```

上面的代码中箭头函数作为参数传入setTimeout中，那this所绑定的作用域就是使用setTimeout方法的作用域。

箭头函数可以让`setTimeout`里面的`this`，绑定定义时所在的作用域。
```javascript
function Timer(){
    this.s1 = 0;
    this.s2 = 0;
    setInterval(() => this.s1++, 1000);
    // 普通函数
    setInterval(function(){
        this.s2++;

    }, 1000);
}

var timer = new Timer();
setTimeout(() => { console.log(timer.s1) }, 3100);
setTimeout(() => { console.log(timer.s2) }, 3100);
// 3;
// 0;

function foo(){
    return () => {
        return () => {
            return () => {
                console.log('id: ' + this.id);
            }
        }
    }
}
var f = foo.call({id: 1});      //id: 1
var t1 = f.call({id: 2})()(); //id: 1
var t2 = f().call({id: 3})(); //id: 1
var t3 = f()().call({id: 4});//id: 1
```

除了`this`, `arguments`、`super`、`new.target`在箭头函数之中也不存在的。
```javascript
function foo(){
    setTimeout(() => {
        console.log(arguments);
    }, 1000);
}
foo(1,2,3,4); //[1,2,3,4]
```

因为箭头函数内部没有this，因此改变`call apply bind`对箭头函数无效
```javascript
(function(){
    return [
        (() => this.x).bind({x: 'inner'})();
    ]
}).call({x: 'outer'});
//['outer'];
```

### 嵌套的箭头函数
```javascript
function insert(value){
    return {
        into: function(array){
            return {
                after: function(afterValue){
                    array.slice(array.indexOf(afterValue) + 1, 0, value);
                    return array;
                }
            };
        }
    };
}
insert(2).into([1, 3]).after(1); //[1,2,3]

// 上面是es5的写法，可以用es6的箭头函数
let insert = (value) => ({
    into: (array) => ({
        after: (afterValue) => {
            array.slice(array.indexOf(afterValue) + 1, 0, value);
            return array;
        }
    })
});
```

箭头函数还有一个功能，就是可以很方便地改写 λ 演算。这里不做赘述。

### 双冒号运算符
函数绑定运算符`::`,双冒号，左边是对象，右边是函数，该运算符会自动将左边的对象作为`this`绑定到右边的函数上。
```javascript
let foo = {a: 1};
function bar(){
    console.log(this.a);
}

foo::bar;
//等同于
bar.bind(foo);

foo::bar(...args);
bar.call(foo, ...args);

const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key){
    return obj::hasOwnProperty(key);
}
```
如果`::`左侧是空的，右侧是一个对象的方法，那么默认绑定在这个对象上
```javascript
let method = ::obj.foo;
// 等同于 
obj::obj.foo;
```

### 尾调用优化


