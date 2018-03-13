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

**注意点**
    
(1) `Object.assign`是浅拷贝

(2)遇到同名的属性并且是嵌套的对象，实行的是整个替换，而不是添加属性。
```javascript
const obj1 = {a: {b: '1', c: '2'}}
const obj2 = {a: {b: 'hello'}}

Object.assign(obj1, obj2);// {a: {b: 'hello'}}
```
(3) 数组的处理，会将数组当作对象处理，数组的index作对象的key

(4) 取值函数。`Object.assign`只进行值的复制，如果要复制的值是一个取值函数，那么将在求值后再复制
```javascript
const source = {
    get foo(){return 1}
}
Obeject.assign({}, source); //{foo: 1}
```
