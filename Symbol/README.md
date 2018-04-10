# Symbol

## 概述
1. Symbol是独一无二的值
2. Symbol不能使用`new`操作符,会报错
3. 可以接受一个字符串做参数，表示对Symbol实例的描述，方便在控制台输出或者转成字符串时作区分
4. 如果Symbol参数是一个对象，那么会调用对象`toString`方法，将其转为字符串
5. Symbol参数只是一个描述，参数相同，也不相等
6. Symbol不能跟其他类型的值进行y运算，会报错， `+-*/`等 和 字符串模板`${}`都不行。
7. Symbol可以显示的转为字符串
8. Symbol也能转为boolean值，但是不能转为数字！

## 作为属性名的Symbol
1. 因为Symbol是第一的，作为属性就不可能重名导致值被覆盖。
2. Symbol作为属性名时，只能在`[]`中访问和定义,不能通过 . 访问
3. Symbol类型可以定义一组常量，保证这组常量的值都是不相等的
4. Symbol作为属性时，该属性时公开属性，不是私有属性

## 实例： 消除魔术字符串
所谓魔术字符串指的是，在代码中多次出现、与代码形成强烈耦合的具体的某一个字符串。通过将其写成一个变量来消除魔术字符串。
```javascript
function getArea(shape, options) {
  let area = 0;

  switch (shape) {
    case 'Triangle': // 魔术字符串
      area = .5 * options.width * options.height;
      break;
    /* ... more code ... */
  }

  return area;
}
getArea('Triangle', { width: 100, height: 100 }); // 魔术字符串
```
```javascript
const shapeType = {
  triangle: 'Triangle'
};

function getArea(shape, options) {
  let area = 0;
  switch (shape) {
    case shapeType.triangle:
      area = .5 * options.width * options.height;
      break;
  }
  return area;
}

getArea(shapeType.triangle, { width: 100, height: 100 });
```
如果仔细分析，可以发现`shapeType.triangle`等于哪个值并不重要，只要确保不会跟其他`shapeType`属性的值冲突即可。因此，这里就很适合改用 `Symbol` 值。
```javascript
const shapeType = {
  triangle: Symbol()
};
```

## 属性名的遍历
1. Symbol作为属性名不会被各类方法或者迭代器遍历：
    - `for...in`
    - `for...of`
    - `Object.keys()`
    - `Object.getOwnPropertyNames()`
    - `JSON.parse()`
2. 但是Symbol是公开属性，有`Object.getOwnPropertySymbols()`方法，可以获取指定对象的Symbol属性组成的数组。
3. 新的API，`Reflect.ownKeys()`可以返回对象所有类型的键名，包括常规键名和Symbol键名
4. 由于Symbol作为名称和属性，不会被常规方法遍历到，我们可以用来定义一些非私有的、但有想用于内部的方法。

## `Symbol.for()` 和 `Symbol.keyFor()`
`Symbol.for`方法可以使用同一个Symbol值，并且登记这个值，只要传入相同的字符串参数就行了。
`Symbol.keyFor`方法返回一个已登记的Symbol类型的key值，只有通过`Symbol.for`登记的值才会有返回。
```javascript
let a = Symbol.for('foo');
let b = Symbol.for('foo');
a === b; //true 此方法会搜索是否存在key为foo的Symbol值，如果存在就返回这个值，不会每次都创建新的值。

Symbol.keyFor(a); //'foo'
let c = Symbol('foo');
Symbol.keyFor(c); //undefined
```

**需要注意的是，`Symbol.for`为 `Symbol` 值登记的名字，是全局环境的，可以在不同的 `iframe` 或 `service worker` 中取到同一个值**。
```javascript
iframe = document.createElement('iframe');
iframe.src = String(window.location);
document.body.appendChild(iframe);

iframe.contentWindow.Symbol.for('foo') === Symbol.for('foo')
// true
```
### 实例： 模块的Singleton模式

## 内置的Symbol值
### Symbol.hasInstance
对象的 `Symbol.hasInstance` 属性，指向一个内部方法。当其他对象使用 `instanceof` 运算符，判断是否为该对象的实例时，会调用这个方法。比如 foo instanceof Foo，在语言内部实际调用的是 `Foo[Symbol.hasInstance](foo)`
```javascript
class MyClass{
    [Symbol.hasInstance](foo){
        return foo instanceof Array
    }
}

[1,2,3] instanceof new MyClass(); //true

class Even{
    static [Symbol.hasInstance](foo){
        return Number(foo)%2 === 0;
    }
}
//等同于
const Even = {
    [Symbol.hasInstance](foo){
        return Number(foo) % 2 === 0;
    }
}
1 instanceof Even; //false
2 instanceof Even; //true
```

### Symbol.isConcatSpreadable
对象的 `Symbol.isConcatSpreadable` 属性等于一个布尔值，表示该对象用于 `Array.prototype.concat` 时，是否可以展开。
- 数组的默认行为是可以展开的，因此数组的 `Symbol.isConcatSpreadable` 属性默认是`undefined`， 设置成true也能在concat
- 类数组跟数组相反，默认不展开，设置为true才会展开
```javascript
let arr1 = ['c', 'd'];
arr1[Symbol.isConcatSpreadable]; //undefined
['a', 'b'].concat(arr1, 'e'); //['a', 'b', 'c', 'd', 'e']

arr1[Symbol.isConcatSpreadable] = false;
['a', 'b'].concat(arr1, 'e'); //['a', 'b', ['c', 'd'], 'e']


let obj = {length: 2, 0: 'c', 1: 'd'}
['a', 'b'].concat(obj, 'e'); //['a', 'b', obj, 'e']

obj[Symbol.isConcatSpreadable] = true;
['a', 'b'].concat(obj, 'e'); //['a', 'b', 'c', 'd', 'e']
``` 

Symbol.isConcatSpreadable属性也可以定义在类里面。

```javascript
class A1 extends Array {
    constructor(args){
        super(args);
        this[Symbol.isConcatSpreadable] = true;
    }
}

class A2 extends Array{
    constructor(args){
        super(args);
    }
    get [Symbol.isConcatSpreadable](){
        return false;
    }
}

let a1 = new A1();
let a2 = new A2();
```

注意，`Symbol.isConcatSpreadable`的位置差异，A1是定义在实例上，A2是定义在类本身，效果相同。


### Symbol.species

### Symbol.match

### Symbol.replace

### Symbol.search

### Symbol.split

### Symbol.iterator

### Symbol.toPrimitive

### Symbol.toStringTag

### Symbol.unscopables