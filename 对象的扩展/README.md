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
上面的代码中，`getOwnPropertyDescriptors`方法返回一个对象，所有源对象的属性名都是这个对象的属性名，对应的值就是这个属性的描述对象。这个方法很容易实现：
```javascript
function getOwnPropertyDescriptors(obj){
    const result = {}
    for(let key of Reflect.ownKeys(obj)){
        result[k] = Object.getOwnPropertyDescriptor(obj, key);
    }

    return result;
}
```
因为`Object.assign()`方法无法正确拷贝`get set`方法，因此引入了这个方法。
```javascript
const source = {
    set foo(value){
        console.log(value)
    }
}

const target1 = {}
Object.assign(target1, source);
Object.getOwnPropertyDescriptor(target1, 'foo'); 
/*
{ 
    value: undefined,
    writable: true,
    enumerable: true,
    configurable: true 
}
*/
```
上面代码中，`source`对象的foo属性的值是一个赋值函数，`Object.assign`方法将这个属性拷贝给`target1`对象，结果该属性的值变成了`undefined`。这是因为`Object.assign`方法总是拷贝一个属性的值，而不会拷贝它背后的赋值方法或取值方法。

此时可以结合`Object.defineProperties`和`Object.getOwnPropertyDescriptors`来实现正确拷贝。
```javascript
const source = {
    set foo(value){
        console.log(value);
    },
    name: 123
}
const target2 = {}
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(source));
```
### __proto__属性
这个属性可以读取和设置当前对象的prototype对象，目前所有浏览器都支持这个属性。
在实现上__proto__调用的是Object.prototype.__proto__。
```javascript
Obejct.defineProperty(Object.prototype, '__proto__', {
    get(){
        let _thisObj = Object(this);
        return Object.getPrototypeOf(_thisObj);
    },
    set(proto){
        if(this === undefined || this === null){
            throw new TypeError();
        }
        if(!isObject(this)){
            return undefined;
        }
        if(!isObject(proto)){
            return undefined;
        }
        let status = Reflect.setPrototypeOf(this, proto);
        if(!status){
            throw new TypeError();
        }
    }
});

function isObject(obj){
    return Object(obj) === obj;
}
```
### Object.setPrototypeOf()
这个方法和`__proto__`作用相同，用来设置一个对象的`prototype`对象, 参数对象本身。
```javascript
//格式
Object.setPrototypeOf(obj, prototype);

//demo
const o = Object.setPrototypeOf({}, null);

//等同于
function setProto(obj, prototype){
    obj.__proto__ = prototype;
    return obj;
}
```
- 如果第一个参数不是对象，那么会自动转成对象。但是由于会返回第一个参数，所以这个操作没有任何效果。
- `null` 和 `undefined` 无法转成对象，如果是第一个参数，会报错
```javascript
Object.setPrototypeOf(1, {}) === 1;
Object.setPrototypeOf('s', {}) === 's';
Object.setPrototypeOf(true, {}) === true;
```
### Object.getPrototypeOf()
- 读取一个对象的原型对象。
- 如果参数不是对象，则会转成对象
- `null` 和 `undefined` 会报错

### super 关键词
this关键字总是指向函数所在的当前对象，ES6有新增了新的关键字`super`, 指向当前对象的原型对象。
```javascript
const proto = {
    foo: 'hello'
}
const obj = {
    foo: 'world',
    find(){
        return super.foo;
    }
}
Object.setPrototypeOf(obj, proto);
obj.find(); //hello
```
- **注意，`super` 只可用在对象的方法中，用在其他地方都会报错**
```javascript
//报错
const obj = {
    foo: super.foo
}

//报错
const obj = {
    foo: () => super.foo
}
//报错
const obj = {
    foo: function(){
        return super.foo
    }
}
```
上面的三种情况都会报错
- 第一个是因为是给属性赋值，报错了
- 第二个和第三个都是在javascript引擎认为这不是对象方法，而是将一个函数赋值给对象的属性，只有`foo(){}`简写的方式才认为是定义对象方法。

JavaScript 引擎内部，`super.foo`等同于`Object.getPrototypeOf(this).foo`（属性）或`Object.getPrototypeOf(this).foo.call(this)`（方法）。

```javascript
const proto = {
    x: 'hello',
    foo(){
        console.log(this.x)
    }
}

const obj = {
    x: 'world',
    foo(){
        super.foo();
    }
}

Object.setPrototypeOf(obj, proto);
obj.foo(); //world
```
上面代码中，super.foo指向原型对象proto的foo方法，但是绑定的this却还是当前对象obj，因此输出的就是world。

## `Object.keys()`,  `Object.values()`, `Object.entries()`
- `Object.keys()` 返回对象**自身可遍历**属性的数组集合
- `Object.values()` 返回对象所有 **自身可遍历** 属性的值的数组合集
- `Object.entries()`方法返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对数组。

### Object.values
返回的数组顺序跟属性的顺序一致
```javascript
const obj = {
    100: 'a',
    2: 'b',
    7: 'c'
}
Object.values(obj); //['b', 'c', 'a']
```

- Object.values会过滤属性名为 Symbol 值的属性。
- 如果参数是字符串，会返回各个字符组成的数组
- 如果不是对象，则会转成对象。由于数值和布尔值的包装对象，都不会为实例添加非继承的属性，会返回空数组
```javascript
Object.values('foo'); //['f', 'o', 'o']
Object.values({[Symbol()]: 'str', a: 2}); //[2]

Object.values(42); //[]
Object.values(true); //[]
```

### Object.entries()
与Object.values()的行为基本一致，除了返回值不同

Object.entries的用途：
- 遍历对象的属性
- 将对象转成`Map`结构
```javascript
//遍历属性
let obj = {a: 1, b: 2}
for(let [k, v] of Object.entries(obj)){
    console.log(
        `${JSON.stringify(k)}: ${JSON.stringify(v)}`
    )
}

//转成map结构
const o = {foo: '123', bar: '456'}
const map = new Map(Object.entries(o));
```

## 扩展运算符

### 解构赋值
对象的解构赋值未被读取的属性和值，就会被分配到指定的对象上。
```javascript
let {x, y, ...z} = {x: 1, y: 2, z: 3, a: 4, b: 5}
z//{z: 3, a: 4, b: 5}
```
- 对象解构赋值右边必须是对象或者可以转换成对象的值
- `...` 解构赋值必须是最后一个参数，否则会报错
- 解构赋值是浅拷贝，如果一个值是引用类型，那么解构赋值只是拷贝的引用。
- 扩展运算符的解构赋值不能拷贝继承的属性
- 在声明语句中，如果使用了`...`解构赋值，那么后边只能跟变量名，否则会报错
```javascript
// 对应上述的第1点
let {...a} = null; //报错
let {x, ...b} = undefined; //报错

//2
let {x, ...y, z} = obj; //语法错误
let {x, ...y, ...z} = obj;//同上

//3
let obj = {a: {b: 1}}
let {...o} = obj
obj.a.b = 2;
o.a.b; //2

//4
let a = {x: 1};
let b = {y: 2};
b.__proto__ = a;
let {y, ...p} = b;
p.x; //undefined

//5
let {x, ...{x, y}} = newObj; //报错

```

### 扩展运算符
对象的扩展运算符用于取出对象所有可遍历属性，拷贝到当前对象之中
```javascript
let z = {a: 1, b: 2}
let n = {...z}
n; //{a: 1, b: 2}

//上面的等同于`Object.assign`
let zClone = Object.assign({}, z);
```