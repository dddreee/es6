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
```