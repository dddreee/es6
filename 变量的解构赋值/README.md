# 变量的解构赋值
    1.数组的解构赋值
    2.对象的解构赋值
    3.字符串的解构赋值
    4.数值和布尔值的解构赋值
    5.函数参数的解构赋值
    6.圆括号问题
    7.用途

***

## 数组的解构赋值
### 基本用法
```javascript
let a = 1;
let b = 2;
let c = 3; //以前的赋值方式

//es6的解构赋值
let [a, b, c] = [1, 2, 3];
```
只要等号两边模式相同，左边的变量就会赋予对应的值，如果解构不成功，则赋值`undefined`。
```javascript
let [a, [b, [c]]] = [1, [2, [3]]];
//a = 1, b = 2, c = 3

let [, , end] = [1, 2, 3]; //end = 3

let [head, ...tail] = [1,2,3,4]; // head = 1, tail = [2,3,4];

let [x, y, ...z] = ['a']; //x = 'a', y = undefined, z = []

let [foo] = [];
let [bar, foo] = ['a']; //以上两种情况foo都是undefined
```

**如果等号右边的不是数组（或者说是不可遍历的结构），将会报错**
```javascript
let [foo] = null;
let [foo] = undefined;
let [foo] = 1;
let [foo] = 'a';
let [foo] = {};
let [foo] = NaN;
//以上情况都会报错
```
***
### 默认值
解构赋值允许默认值，es6内部使用`===`判断一个位置是否有值，当一个数组成员=== `undefined`时，默认值才生效。
```javascript
let [x = 1] = [undefined];//x = 1

let [y = 1] = [null]; //y = null
//null不严格等于undefined。默认值不生效
```

如果默认值是一个表达式，那么这个表达式是惰性求值，只有在用到的时候才会求值。
```javascript
function f(){
    console.log('aaa');
}
let [x = f()] = [1];
```
上面的代码中，因为x能取到值，因此不会进行默认值赋值，函数f也不会运行,等价于下面的代码。
```javascript
let x;
if([1][0] === undefined){
    x = f();
}else{
    x = [1][0];
}
```
默认值可以引用解构赋值的其他变量，但该变量必须已经声明。
```javascript
let [x = 1, y = x] = []; //x = y = 1
let [x = 1, y = x] = [2]; //x = y = 2
let [x = 1, y = x] = [2, 3]; //x = 2, y = 3
let [x = y, y = 1] = []; //ReferenceError: y is not defined
```
***
### 对象的解构赋值
解构不仅可以用于数组，同样能用于对象。对象的解构跟数组不同，数组必须顺序相同，而对象的属性名和变量相同就行。
```javascript
let {a, b} = {a: 'a', b: 'b'}; //a = 'a', b = 'b'
```

如果变量名与属性名不一致，必须写成下面这样。对象的解构赋值的内部机制，是先找到同名属性，然后再赋给对应的变量。真正被赋值的是后者，而不是前者。
```javascript
let obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};

let { p, p: [x, { y }] } = obj;
x // "Hello"
y // "World"
p // ["Hello", {y: "World"}]
```

如果解构存在key: value形式，那么key仅用于匹配对应的属性，最终将值赋给value变量

对象的解构也可以指定默认值。
```javascript
var {x = 3} = {}; //x = 3
var {x, y = 5} = {x: 1}; //x = 1, y = 5
var {x: y = 3} = {}; //y = 3
var {x: y = 3} = {x: 5}; //y = 5
var {message: msg = 'something went wrong'} = {}; //msg = 'something went wrong'
```
默认值规则等同于数组的解构默认值。

对象解构的几种错误：
```javascript
var {foo: {boo}} = {boo: '123'}; //报错 右侧的对象不存在foo属性，通过foo属性的值获取boo属性时就会报错，等同于undefined.boo取值报错

let x;
{x} = {x: 1};// 语法错误，js引擎会将{x} 理解为代码块

//只有不将代码块写在行首,才能正确运行
let x;
({x} = {x: 1});
```
***
### 字符串的解构赋值
```javascript
const [a, b, c, d, e] = 'hello';
//a = 'h'
//b = 'e'
//c = 'l'
//d = 'l'
//e = 'o'
```
字符串有类似于数组的length属性，可以对这个属性解构赋值。
```javascript
let {length: len} = 'hello'; //len = 5
```
***
### 数值和布尔值的解构赋值
解构赋值时，如果右边的值是数值或者布尔值，则会转化成对象
```javascript
let {toString: s} = 123;
s === Number.prototype.toString; //true
let {toString: s2} = true;
s === Boolean.prototype.toStgring; //true
```

解构赋值规则：只要等号右边不是对象或者数组,就优先转为对象。由于`null`和`undefined`无法转为对象，所以对他们进行解构赋值会报错
```javascript
let {prop: x} = undefined;
let {prop: y} = null;
//都会报错 TypeError
```
***
### 函数参数的解构赋值
```javascript
function add([x, y]){
    return x + y;
}

add([1, 2]); //3
```
上面的代码中，add函数传入的参数是一个数组，但在运行是被解构成变量`x`和`y`。

函数参数的解构也可以使用默认值。
```javascript
function move({x = 0, y = 0} = {}){
    return [x, y];
}
move({x: 5, y: 7}); //[5, 7]
move({x: 1}); //[1, 0]
move({});//[0, 0]
move(); //[0,0]
```

上面的代码中，函数`move`的参数是一个对象,通过对这个对象解构,得到变量`x`和`y`的值。如果解构失败，则`x`和`y`的值为默认值

```javascript
function move({x, y} = {x: 0, y: 0}){
    return [x, y];
}

move({}); //[undefined, undefined]
move(); //[0, 0]
```
上面的代码是给move传入一个默认参数， 不是对解构默认值。
***
### 圆括号的问题
不使用括号的情况：

（1）变量声明语句
```javascript
// 全部报错
let [(a)] = [1];

let {x: (c)} = {};
let ({x: c}) = {};
let {(x: c)} = {};
let {(x): c} = {};

let { o: ({ p: p }) } = { o: { p: 2 } };
```
上面 6 个语句都会报错，因为它们都是变量声明语句，模式不能使用圆括号。

（2）函数参数

函数参数也属于变量声明，因此不能带有圆括号。
```javascript
// 报错
function f([(z)]) { return z; }
// 报错
function f([z,(x)]) { return x; }
```

（3）赋值语句的模式

```javascript
// 全部报错, 整个模式放在圆括号之中，导致报错。
({ p: a }) = { p: 42 };
([a]) = [5];

// 报错，将一部分模式放在圆括号之中，导致报错。
[({ p: a }), { x: c }] = [{}, {}];
```

可以使用圆括号的情况
```javascript
[(b)] = [3]; // 正确
({ p: (d) } = {}); // 正确
[(parseInt.prop)] = [3]; // 正确
```
上面三行语句都可以正确执行，因为首先它们都是赋值语句，而不是声明语句；其次它们的圆括号都不属于模式的一部分。第一行语句中，模式是取数组的第一个成员，跟圆括号无关；第二行语句中，模式是p，而不是d；第三行语句与第一行语句的性质一致。
***
### 用途
(1)交换变量的值
```javascript
let x = 1;
let y = 2;
[x, y] = [y, x];
```

(2)从函数返回多个值

通过解构赋值，可以轻松的从函数返回的对象或数组中取值
```javascript
function example(){
    return {
        foo: 1,
        bar: 2
    }
}
let {foo, bar} = example();
//foo = 1, bar = 2
```

(3)函数参数的定义

解构赋值可以方便地将一组参数与变量名对应起来。
```javascript
//有序参数
function a([x, y, z]){
    return x + y + z;
}
a([1, 2, 3]); //6

//无序参数
function b({x, y, z}){
    return x + y + z;
}
b({
    x: 1,
    y: 2,
    z: 3
}); //6
```

(4)提取JSON数据

类似对象的解构赋值

(5)函数参数的默认值

(6)遍历map结构

任何部署了 Iterator 接口的对象，都可以用for...of循环遍历。Map 结构原生支持 Iterator 接口，配合变量的解构赋值，获取键名和键值就非常方便。
```javascript
const map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for(let [key, value] of map){
    console.log(key + ' is ' + value);
}
//first is hello
//second is world

//只想获取键名
for(let [key] of map){
    ...
}

//只想获取值
for(let [, value] of map){
    ...
}
```

(7)输入模块的指定方法

```javascript
const { SourceMapConsumer, SourceNode } = require("source-map");
```