# 对象的扩展
## 属性的简洁表示法
ES6允许直接写入变量和函数，作为对象的属性和方法
```javascript
const foo = 'foo';
const bar = {foo};
bar; //{foo: 'foo'}

function f(x, y){
    return {x, y};
}
// 等同于
function f2(x, y){
    return {x: x, y: y};
}
f(1, 2); //{x: 1, y: 2}
f2(1, 2); //{x: 1, y: 2}

// 除了属性，方法也可以简写
const o = {
    method(){
        return 'Hello';
    }
}
// 等同于
const o2 = {
    method: function(){
        return 'Hello';
    }
}

let birth = '2000/10/10';
const Person = {
    name: 'Jame',
    // 等同于birth: birth
    birth,

    hello(){
        console.log(`My name is ${this.name}`)
    }
}

// 这种写法对于函数返回值很方便
function getPoint(){
    const x = 1;
    const y = 2;
    return {x, y}
}
getPoint(); //{x: 1, y: 2}

// CommonJS 的模块输出
let ms = {};

function getItem(key){
    return key in ms ? ms[key] : null;
}
function setItem(key, value){
    ms[key] = value
}
function clear(){
    ms = {};
}
module.exports = {getItem, setItem, clear};

// get和set也能简写
const cart = {
    _wheels: 4,

    get _wheels(){
        return this._wheels;
    },

    set _wheels(value){
        if(value < this._wheels){
            throw new Error('数值太小了！');
        }else{
            this._wheels = value;
        }
    }
}
```
**简洁写法的属性名总是字符串。**
```javascript
const obj = {
    class(){}
}
// 等同于
const obj = {
    'class': function(){}
}
```

如果是Generator函数，则要在加一个`*`号
```javascript
const obj = {
    * m(){
        yield 'hello world'
    }
}
```

## 属性名表达式
函数的name属性，返回的函数名,对象方法也是函数，因此也有name属性。如果对象方法使用了`get`和`set`,那么函数的`name`属性不在该方法上，而是通过`Object.getOwnPropertyDescriptor`获取这个属性的描述对象，`name`属性就在这个对象的get和set函数上获取
```javascript
const Person = {
    say(){
        console.log('hello');
    }
}
Person.say.name; //say

const obj = {
  get foo() {},
  set foo(x) {}
};
obj.foo.name; //TypeError: Cannot read property 'name' of undefined
// 获取foo的描述对象
const desc = Object.getOwnPropertyDescriptor(obj, 'foo');
desc.get.name; //get foo
desc.set.name; //set foo
```
这里有两种特殊情况：`bind`方法创造的函数, `name`属性返回`bound`加上原来的函数名;`Function`构造函数创造的函数,`name`属性返回`anonymous`
```javascript
(new Function()).name ;//anonymous
var doSomething = function(){}
doSomething.bind().name; //bound doSomething

// Symbol pass
```

## Object.is()
ES5比较两个值是否相等，只有`==`和`===`两种运算符，然而NaN不等于自身，+0和-0能相等，ES6提出了同值相等算法，来解决这个问题。
```javascript
+0 === -0; //true
NaN === NaN; //false

Object.is(+0, -0); //false
Object.is(NaN, NaN); //true
```

## Object.assign()
`Object.assign`方法用户合并对象，将源对象的可枚举属性，合并到目标对象。
```javascript
const target = {a: 1};

const source1 = {b: 2};
const source2 = {c: 3};
Object.assign(target, source1, source2);
target; //{a: 1, b: 2, c: 3}
```
这个方法的第一个参数是目标对象，之后的都是源对象

**注意**， 如果存在同名属性，那么后面的会覆盖之前的。如果只有一个参数，`Object.assign`会直接返回该参数， 如果参数不是对象，则会先转成对象。由于`undefined`和`null`无法转成对象，就会报错！
```javascript
Object.assign({a: 1}); //{a: 1}
typeof Object.assign(2); //'object'
Object.assign(null); //或者传入的是undefined， 报错
```

如果其他的类型的值（字符串，数字，布尔），不会报错，除了字符串会作为数组拷贝入目标对象，其他类型都不会起作用。
```javascript
const v1 = 'abc';
const v2 = true;
const v3 = 10;

const obj = Object.assign({}, v1, v2, v3);
obj; //{'0': 'a', '1': 'b', '2': 'c'}
```
**必须是源对象自身的属性，并且是可枚举的属性才能拷贝**

### **注意点**
    
(1) `Object.assign`是浅拷贝

(2)遇到同名的属性并且是嵌套的对象，实行的是整个替换，而不是添加属性。
```javascript
const obj1 = {a: {b: '1', c: '2'}}
const obj2 = {a: {b: 'hello'}}

Object.assign(obj1, obj2);// {a: {b: 'hello'}}
```
(3) 数组的处理，会将数组当作对象处理，数组的index作对象的key
```javascript
Object.assign([1,2,3], [4,5]); //[4, 5, 3]
```

(4) 取值函数。`Object.assign`只进行值的复制，如果要复制的值是一个取值函数，那么将在求值后再复制
```javascript
const source = {
    get foo(){return 1}
}
Obeject.assign({}, source); //{foo: 1}
```
### 常见用途
(1)为对象添加属性
```javascript
class Point{
    constructor(x, y){
        Object.assign(this, {x, y})
    }
}
```
通过上述方法，将x，y属性添加到Point的实例对象

(2)为对象添加方法
```javascript
Object.assign(SomeClass.prototype, {
    fn(){

    },
    fn2(){

    }
})
```

(3)克隆对象

克隆只能克隆自身的属性，继承的属性无法克隆，可以通过克隆原型对象来获取继承的值
```javascript
function clone(obj){
    let objProto = Object.getPrototypeOf(obj);
    return Object.assign(objProto, obj)
}
```
(4)合并多个对象。
```javascript
const merge = (target, ...sources) => Object.assign(target, ...sources);
const merge2 = (...sources) => Object.assign({}, ...sources); //返回一个新对象
```
(5)指定默认值
```javascript
const DEFAULT = {
    name: '',
    age: ''
}
function processContent(options){
    // 如果options没有，那么返回DEFAULT，如果有，就会覆盖对应的属性
    options = Object.assign(DEFAULT, options);
    console.log(options);
}
```
---
## 属性的可枚举型和遍历
属性的可枚举型可以通过`Object.getOwnPropertyDescriptor`方法获取
```javascript
const obj = {a: 1}
Object.getOwnPropertyDescriptor(obj, 'a');
// {
//     value: 1,
//     writable: true,
//     enumerable: true,
//     configurable: true
// }
```
如果`enumerable`值是`false`,以下几种操作就会跳过
 - `for...in`循环：只会循环自身和继承的可枚举属性
 - `JSON.stringify`会跳过不可枚举的属性
 - `Object.assign`同样会跳过自身不可枚举的属性
 - `Object.keys()`返回自身所有可枚举的键名

另外，ES6 规定，所有 Class 的原型的方法都是不可枚举的。
```javascript
Object.getOwnPropertyDescriptor(class {foo(){}}.prototye, 'foo').enumerable; //false
```
### 属性的遍历
ES6有5种方法可以遍历对象：

(1)`for...in`循环遍历对象自身的和继承的可枚举属性

(2)`Object.keys(obj)`返回一个数组，包括自身的（不含继承的）所有可枚举属性（不含Symbol属性）的键名。

(3)`Object.getOwnPropertyNames(obj)`返回一个数组，包含自身的所有属性（不含Symbol属性，但是包括不可枚举属性）的键名。

(4)`Object.getOwnPropertySymbols(obj)`Object.getOwnPropertySymbols返回一个数组，包含对象自身的所有 Symbol 属性的键名。

(5)`Reflect.ownKeys(obj)`返回一个数组，**包含自身所有的键名。**

### Object.getOwnPropertyDescriptors()
ES2017引入了这个方法，返回对象自身所有属性（非继承）的描述对象，如果一个属性没有值只有取值函数或者赋值函数，`Object.assign()`方法不能正确拷贝，可以结合`Object.getOwnPropertyDescriptors()`和`Object.defineProperty`正确拷贝。
```javascript
const obj = {
    foo: 123,
    get bar(){
        return 'abc'
    }
}

Object.getOwnPropertyDescriptors(obj);
/*
{
    foo: {
        value: 123,
        writable: true,
        enumerable: true,
        configurable: true
    },
    bar: {
        get: [Function: get bar],
        set: undefined,
        enumerable: true,
        configurable: true
    }
}
*/
```


