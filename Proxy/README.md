# Proxy
## 1. 基本概念
Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。

Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。Proxy 这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。
```javascript
var obj = new Proxy({},{
    get: function(target, key, receiver){
        console.log(`getting ${key}!`);
        return Reflect.get(target, key, receiver);
    },
    set: function(target, key, value, receiver){
        console.log(`setting ${key}`);
        return Reflect.set(target, key, value, receiver);
    }
});
obj.count = 1;//setting count!
++obj.count;
//getting count!
//setting count!
//2
```
Proxy 实际上重载（overload）了点运算符，即用自己的定义覆盖了语言的原始定义。

`Proxy` 对象的所有用法，都是上面这种形式，不同的只是 `handler` 参数的写法。其中，`new Proxy()`表示生成一个 `Proxy` 实例， `target` 参数表示所要拦截的目标对象， `handler` 参数也是一个对象，用来定制拦截行为。

如果 `handler` 没有设置任何拦截，那就等同于直接通向原对象。如果 `handler` 是空对象，那么访问 `Proxy` 实例就相当于访问 `target`
```javascript
var target = {};
var handler = {};
var obj = new Proxy(target, handler);
obj.a = 'b';
obj.a;//'b'
```
- Proxy实例可以赋值到Object属性中
- Proxy也可以作为其他对象的原型对象

同一个拦截器函数，可以设置拦截多个操作：
```javascript
var handler = {
    get: function(target, name){
        if(name === 'prototype'){
            return Object.prototype;
        }
        return 'Hello, ' + name;
    },
    apply: function(target, thisBinding, args){
        return args[0];
    },
    construct: function(target, args){
        return {value: args[1]}
    }
}
var fProxy = new Proxy(function(x, y){
    return x + y
}, handler);

fProxy(1, 2); //1
new fProxy(1, 2); //{value: 2}
fProxy.prototype === Object.prototype; //true
fProxy.foo === "Hello, foo"; //true
```
Proxy一共有13中拦截方式：
- **`get(target, propKey, receiver)`**: 拦截对象的属性读取, 比如 `proxy.foo` 或者 `proxy['foo']` 

- **`set(target, propKey, value, receiver)`** : 拦截对象属性的设置，比如 `proxy.foo = v` 或 `proxy['foo'] = v` ，返回一个布尔值。

- **`has(target, propKey)`**：拦截 `propKey in proxy` 的操作，返回一个布尔值。

- **`deleteProperty(target, propKey)`**: 拦截 `delete proxy[propKey]` 的操作，返回一个布尔值。

- **`ownKeys(target)`** : 拦截 `Object.getOwnPropertyNames(proxy)` 、  `Object.getOwnPropertySymbols(proxy)` 、 `Object.keys(proxy)` ，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而 `Object.keys()` 的返回结果仅包括目标对象自身的可遍历属性。

- **`getOwnPropertyDescriptor(target, propKey)`**：拦截 `Object.getOwnPropertyDescriptor(proxy, propKey)` ，返回属性的描述对象。

- **`defineProperty(target, propKey, propDesc)`**：拦截 `Object.defineProperty(proxy, propKey, propDesc)` 、 `Object.defineProperties(proxy, propDescs)` ，返回一个布尔值。 

- **`preventExtensions(target)`**：拦截 `Object.preventExtensions(proxy)` ，返回一个布尔值。

- **`getPrototypeOf(target)`**：拦截 `Object.getPrototypeOf(proxy)` ，返回一个对象。

- **`isExtensible(target)`**：拦截 `Object.isExtensible(proxy)` ，返回一个布尔值。

- **`setPrototypeOf(target, proto)`**：拦截 `Object.setPrototypeOf(proxy, proto)` ，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。

- **`apply(target, object, args)`**：拦截 `Proxy` 实例作为函数调用的操作，比如 `proxy(...args)` 、 `proxy.call(object, ...args)` 、 `proxy.apply(...)`。

- **`construct(target, args)`**：拦截 `Proxy` 实例作为构造函数调用的操作，比如 `new proxy(...args)`。

---
## 2. Proxy实例的方法

### get()
`get`方法用于拦截对象属性的读取操作，可以接受三个参数，依次为目标对象、属性名和 proxy 实例本身（严格地说，是操作行为所针对的对象），其中最后一个参数可选。
- get的用法上文已经说明了

- get方法可以继承
```javascript
let proto = new Proxy({}, {
    get(target, property, receiver){
        console.log('get ' + property);
        return target[property]
    }
});
let obj = Object.create(proto);
obj.name;
//"get name"
//undefined
```

- 利用 Proxy，可以将读取属性的操作（get），转变为执行某个函数，从而实现属性的链式操作。
```javascript
var pipe = (function () {
  return function (value) {
    var funcStack = [];
    var oproxy = new Proxy({} , {
      get : function (pipeObject, fnName) {
        if (fnName === 'get') {
          return funcStack.reduce(function (val, fn) {
            return fn(val);
          },value);
        }
        funcStack.push(window[fnName]);
        return oproxy;
      }
    });

    return oproxy;
  }
}());

var double = n => n * 2;
var pow    = n => n * n;
var reverseInt = n => n.toString().split("").reverse().join("") | 0;

pipe(3).double.pow.reverseInt.get; // 63
```

- 利用Proxy的get拦截，实现一个生成各种DOM节点的通用函数dom
```javascript
const dom = new Proxy({}, {
    get(target, property){
        // 每次dom.xxx返回一个函数, dom.xxx(...)
        return function(attrs = {}, ...children){
            // 根据property去创建对应的dom节点 如dom.div就生成div节点
            const el = document.createElement(property);
            // 给节点添加属性
            for(let prop of attrs.keys()){
                el.setAttribute(prop, attrs[prop]);
            }
            // 遍历children参数
            for(let child of children){
                // 如果是字符串就是转成text节点
                if(typeof child === 'string'){
                    child = document.createTextNode(child);
                }
                // 将子节点添加到当前dom中，如果子节点是dom.a这类的，那么会再次调用拦截器，并将最终返回的dom节点添加进来
                el.appendChild(child);
            }
            return el;
        }
    }
});

const el = dom.div({},
    'Here is div element',
    dom.a({
        href: 'https://www.baidu.com'
    }, '跳转到百度'),
    'I like',
    dom.ul({},
        dom.li({}, '1'),
        dom.li({}, '2'),
        dom.li({}, '3'),
    )
)
```
- get方法的第三个参数`receiver`，总是为当前的 `Proxy` 实例。
- 如果一个属性不可配置（configurable）和不可写（writable），则该属性不能被代理，通过 Proxy 对象访问该属性会报错。
```javascript
const target = Object.defineProperties({}, {
    foo: {
        value: 123,
        writable: false,
        configurable: false
    }
});

const handler = {
    get(target, propKey){
        return 'abc';
    }
}
const proxy = new Proxy(target, handler); //报错
```

### set()
set方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 Proxy 实例本身，其中最后一个参数可选。

注意，如果目标对象自身的某个属性，不可写或不可配置，那么set方法将不起作用。

### apply()
apply拦截函数的调用、call 和 apply 调用。

apply方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组。
```javascript
const target = function(){ return 'I am the target' }
const p = new Proxy(target, {
    apply(target, curr, args){
        return 'I am the proxy'
    }
});
p(); //I am the proxy
```

# 下面太多了不写了。。。