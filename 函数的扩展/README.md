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




