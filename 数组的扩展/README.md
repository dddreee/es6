# 数组的扩展
## 扩展运算符
### 含义
扩展运算符是三个点（...），好比rest参数的逆运算，将一个数组转为逗号分隔的参数序列。
```javascript
console.log(...[1,2,3]); //1,2,3
console.log(1, ...[2,3,4], 5); //1,2,3,4,5

[...document.querySelectAll('div')]; //[<div>, <div>, <div>]
```

该运算符主要用于函数调用
```javascript
function push(array, ...items){
    array.push(...items);
}

function add(x, y){
    return x + y;
}

add(...[2, 48]); // 50

// 如果扩展运算符后面跟的是空数组，不产品任何效果
[...[], 1]; //[1]

// 扩展运算符后面可以跟随表达式
[...( x > 0 ? ['a']: []), 'b'];
```

### 替代函数的apply方法。
函数Math.max方法取最大值
```javascript
Math.max(...[4, 14, 22]); //22

// es5
Math.max.apply(null, [4, 14, 22]);

var arr1 = [1,2,3];
var arr2 = [4,5,6];
arr1.push.apply(null, arr2);
arr1.push(...arr2);
```

### 应用
(1).复制数组
```javascript
var arr = [1,2,3];
var arr2 = [...arr];
arr2 ===  arr; //false
// 如果数组内部还是引用类型，那么内部的引用类型还是会受原始数组影响
var arr3 = [{a: 1}]
var arr4 = [...arr3];
arr4[0].a = 2;
arr3[0].a; //2
```
(2).合并数组
```javascript
arr1.concat(more);
// es6
[...arr1, ...more];
```

(3).与解构赋值结合

扩展运算符可以和解构赋值结合起来,生成数组。
```javascript
a = list[0], rest = list.slice(1);
[a, ...rest] = list;

const [first, ...rest] = [];
// first = undefined, rest = []

const [foo, ...bar] = ['foobar'];
// foo = 'foobar', bar = []
```
**用于解构赋值时，扩展运算符必须放在最后，否则会报错**
```javascript
const [...butLast, last] = [1, 2, 3, 4, 5];
// 报错

const [first, ...middle, last] = [1, 2, 3, 4, 5];
// 报错
```
(4).字符串
```javascript
[...'hello']; //['h', 'e', 'l', 'l', 'o']

'x\uD83D\uDE80y'.length // 4
[...'x\uD83D\uDE80y'].length // 3
// 这样可以正确识别字符的长度
function length(str){
    return [...str].length;
}

let str = 'x\uD83D\uDE80y';

str.split('').reverse().join('')
// 'y\uDE80\uD83Dx'

[...str].reverse().join('')
// 'y\uD83D\uDE80x'
// 如果不用扩展运算符，字符串的reverse操作就不正确。
```

(5).实现Iterator接口的对象
```javascript
let nodeList = document.querySelectAll('div');
let array = [...nodeList];
```
上述代码中，`querySelectAll`方法返回的是一个`nodeList`对象，这是一个类数组，可以通过扩展运算符转换成数组。对于那些没有部署`Iterator`接口的对象，扩展运算符无法将其转为真正的数组。
```javascript
let arrayLike = {
    '0': 'a',
    '1': 'b',
    'length': 2
}

let arr = [...arrayLike]; //报错TypeError: Cannot spread non-iterable object.
```
(6). Map和Set结构，Generator函数
<!-- pass -->

## Array.from()
Array.from方法可以将类数组和可遍历的对象转换成数组
```javascript
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
};

// ES5的写法
var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']

// ES6的写法
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']
```
实际应用中，DOM返回的`nodeList`和`arguments`对象都可以通过`Array.from`转换成数组。

如果Array.from的参数是一个数组，那么将返回一个一摸一样的数组。

扩展运算符也能将某些数据结构转换成数组，它背后调用的是遍历器接口(Symbol.iterator)，如果一个对象没有部署这个接口，那么就无法转换。但是`Array.from`不同，类数组也可以转换，即只要有length属性，就能转换，但是扩展运算符就无法转换了。
```javascript
Array.from({length: 3}); //[undefined,undefined,undefined]
// es5可以通过Array.prototype.slice方法替代。
Array.prototype.slice.call({length: 3});
```

`Array.from`还能接受第二个参数，作用类似于数组的map方法,用来对每个元素进行处理,将处理的值放入返回的数组。
```javascript
Array.from(arrayLike, x => x*x);
// 等同于
Array.from(arrayLike).map(x => x*x);

Array.from([1,2,3], x => x * x); //[1,4,9]
```

## Array.of()
`Array.of`方法将一组值转化成数组。
```javascript
Array.of(1,2,3); //[1,2,3]
Array.of(3); // [3]
Array.of(3).length; //1

// 弥补了Array()因为参数不同造成不同结果的缺陷
Array(); //[]
Array(3); //[undefined, undefined, undefined]
Array(3,4); //[3,4]

// Array.of基本可以替代Array, new Array()，不会因为参数不同而导致的重载
Array.of(); //[]
Array.of(undefined); //[undefined]
Array.of(3,4); //[3,4]
```
`Array.of`总是返回参数组成的数组，如果没有参数，返回空数组。

## 数组实例的 copyWithin()
在当前数组内部，将制定位置的成员复制到其他位置（会覆盖原有成员）,然后返回当前数组，使用这个函数，会修改当前数组。
```javascript
var arr = [1,2,3,4];
arr.copyWithin(0,2);//[3,4,3,4]
```
这个方法接收3个参数：
- target（必需）：从该位置开始替换数据。如果为负值，表示倒数。
- start（可选）：从该位置开始读取数据，默认为 0。如果为负值，表示倒数。
- end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。

```javascript
// 将3号位复制到0号位
[1, 2, 3, 4, 5].copyWithin(0, 3, 4)
// [4, 2, 3, 4, 5]

// -2相当于3号位，-1相当于4号位
[1, 2, 3, 4, 5].copyWithin(0, -2, -1)
// [4, 2, 3, 4, 5]

// 将3号位复制到0号位
[].copyWithin.call({length: 5, 3: 1}, 0, 3)
// {0: 1, 3: 1, length: 5}

// 将2号位到数组结束，复制到0号位
let i32a = new Int32Array([1, 2, 3, 4, 5]);
i32a.copyWithin(0, 2);
// Int32Array [3, 4, 5, 4, 5]

// 对于没有部署 TypedArray 的 copyWithin 方法的平台
// 需要采用下面的写法
[].copyWithin.call(new Int32Array([1, 2, 3, 4, 5]), 0, 3, 4);
// Int32Array [4, 2, 3, 4, 5]
```

### 数组实例的find()和findIndex()
数组实例的`find`方法，找出第一个符合条件的数组成员。他的参数是一个回调函数，所有数组成员一次执行这个函数，直到第一个符合条件的元素出现并返回这个元素，如果没有则返回`undefined`。
```javascript
let arr = [1, 2, 3, -4, 5];
arr.find((n) => n < 0);//5

[1, 5, 10, 11].find(function(value, index, arr){
    return value > 9;
}); //10
```
find函数可以接受3个参数，一次为当前值，当前位置和原数组。
findIndex方法和find类似，只不过返回的是符合条件的元素的位置，如果没有符合条件的，则返回-1。


这两个方法都能接收第二个参数，用来绑定回调函数种的this对象。
```javascript
let person = {
    name: 'Jason',
    age: 9
}
[1, 5, 10, 11].find((n) => n > this.age, person);//10
```

**这两个方法都能发现NaN，indexOf方法无法正确数组的NaN。**
```javascript
[NaN].indexOf(NaN); //-1

[NaN].findIndex(y => Object.is(NaN, y)); //0
```
### 数组实例的fill()
`fill`方法使用给定值，填充一个数组。
```javascript
['a', 'b', 'c'].fill(7);//[7, 7, 7]

new Array(3).fill(7); // [7, 7, 7]
```

`fill`方法可以接受第二和第三个参数，指定填充的起始和结束的位置。
```javascript
[1,2,3].fill(7, 1, 2); //[1, 2, 7]
```

从1号位开始，填充7，到2号位结束。 包含起始位，不包含结束位。如果填充的是一个对象，那么数组中填充的是同一个对象，不是深拷贝。
```javascript
let obj = {name: 'Mike'};
[1, 2, 3].fill(obj);
obj.name = 'Jack';
[{name: 'Jack'}, {name: 'Jack'}, {name: 'Jack'}]
```
### 数组实例的entries(), keys(), values();
这三个方法都返回一个遍历器对象，可以被`for...of`进行遍历。`entries()`是对键值对的遍历，`keys()`是对键的遍历，`values()`是对值的遍历。
```javascript
for (let index of ['a', 'b'].keys()) {
  console.log(index);
}
// 0
// 1

for (let elem of ['a', 'b'].values()) {
  console.log(elem);
}
// 'a'
// 'b'

for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"
```
如果不使用`for...of`，可以通过遍历器的`next`方法，进行遍历：
```javascript
let letter = ['a', 'b', 'c'];
let entries = letter.entries();
console.log(entries.next().value); //[0, 'a']
console.log(entries.next().value); //[1, 'b']
console.log(entries.next().value); //[2, 'c']
```
### 数组实例的includes()
Array.prototype.includes方法返回一个布尔值，表示某个数组是否包含给定的值，与字符串的includes方法类似。ES2016 引入了该方法。
```javascript
[1, 2, 3].includes(2)     // true
[1, 2, 3].includes(4)     // false
[1, 2, NaN].includes(NaN) // true
```

`includes`方法弥补了`indexOf`方法对`NaN`判断的不足。另外Map和Set结构还有一个`has`方法，需要注意他们之间的区别。

### 数组的空位
数组的空位是指在某个位置，是空的，没有任何值。需要注意的是，空位不是`undefined`,`undefined`是值，而空位是没有任何值。`in`运算符可以说明：
```javascript
0 in [undefined, undefined, undefined]; //true
0 in [,,]; //false
```
ES5对空位的处理，很不一致：

- `forEach`, `filter`, `reduce`, `every`和`some`这些方法会跳过空位
- `map`会跳过空位，但是会保留这个这位。
- `join`和`toString`会将空位视为`undefined`，而`undefined`和`null`会被处理成空字符串
```javascript
// forEach
[, 'a'].forEach((x, i) => console.log(i)); //1

// filter
['a', , 'b'].filter(x => true);// ['a', 'b'];

// every
[, 'a'].every(x => x === 'a'); //true

// some
[, 'a'].some(x => x !== 'a'); //false

// map
[, 'a'].map(x => 1); //[1];

// join
[, 'a', undefined, null].join('#'); //#a##

// toString
[, 'a', undefined, null].toString(); //,a,,
```

ES6则明确的会将空位转为undefined
```javascript
// Array.from
Array.from([1, ,2]); //[1. undefined, 2]

// ...
[...[1, , 2]]; //[1. undefined, 2]

// copyWithin
[, 'a','b' ,,].copyWithin(2, 0); //[,"a",,"a"]

// fill
new Array(3).fill('a'); //['a', 'a', 'a']

// for...of
let arr = [, ,];
for(let i of arr){
    console.log(i);
}
```

`entries()`、`keys()`、`values()`、`find()`和`findIndex()`会将空位处理成`undefined`。