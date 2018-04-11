# Set和Map数据结构
## 1. Set
### 基本用法
Set结构类似于数组，但是成员的值都是唯一的，没有重复的值
1. Set本身就是构造函数，可以通过`new`创建实例，并且通过`add`方法添加成员，重复的值不会添加
2. Set函数可以接受一个数组做参数，来初始化。
3. Set内部判断两个值是否相等，用的是“`Same-value-zero equality`”, 类似于"`===`"判断，唯一不同的就是NaN的判断，**`Set`内部判断两个NaN是相等的**。

### Set的实例和属性
属性：
- `Set.prototype.constructor`: 构造函数，默认是Set
- `Set.prototype.size`: 返回实例的成员数

方法：
- `add(value)`: 添加一个值，如果重复则不添加,返回自身
- `delete(value)`: 删除某个值，返回布尔值，表示是否成功删除
- `has(value)`: 返回布尔值，表示是否是该set的成员
- `clear()`: 清楚所有成员，没有返回值

可以通过`Array.from`方法，将set数据转化成数组

### 遍历操作
Set结构的实例有四个遍历方法：

- `keys()`: 返回键名的遍历器
- `values()`: 返回值的遍历器
- `entries()`: 返回键值对的遍历器
- `forEach`: 使用回调函数遍历每个成员

需要特别指出的是，Set的遍历顺序就是插入顺序。这个特性有时非常有用，比如使用 Set 保存一个回调函数列表，调用时就能保证按照添加顺序调用。

#### keys, values, entries
1. keys, values, entries 这三个返回的都是遍历器属性。由于Set没有键名，只有键值，因此 keys 和 values 的返回是相同的
2. entries返回的遍历器同时包含键名和键值，所以每次输出的键名和键值都是一样的
 ```javascript
let set = new Set(['red', 'green', 'blue']);
set.keys(); //{'red', 'green', 'blue'}
set.values(); //{'red', 'green', 'blue'}

for(let x of set.entries()){
    console.log(x);
}
//['red', 'red']...
 ```

 Set结构的实例默认可遍历，它的默认遍历器生成函数就是values方法，可以直接通过for...of遍历set
 ```javascript
let set = new Set([1, 2, 3]);
for(let item of set){
    console.log(item);
}
//1
//2
//3
 ```
forEach方法跟数组的类似，对每个成员执行某种操作，没有返回值。forEach方法第一个参数是一个函数，此函数有3个参数：key, value, 当前对象。forEach还有第二个参数，用来替代函数中的this。

## 2. WeakSet

## 3. Map
### 基本概念
js对象本质上就是键值对的集合(HASH 结构)，传统意义上对象的键名只能是字符串，有很多限制。
```javascript
const data = {}
const element = document.getElementById('myDiv');
data[element] = 'metadata';
data['[object HTMLDivElement]']; //metadata
```
上面代码原意是将一个 DOM 节点作为对象data的键，但是由于对象只接受字符串作为键名，所以element被自动转为字符串`[object HTMLDivElement]`。

因此ES6提供了Map数据结构，类似于对象，也是键值对的集合，但是“键”的范围不仅仅是字符串，还能是各种类型的值。

Map实例有4个方法： get, set, has, delete, clear。实例属性size
```javascript
const map = new Map();
const o = {p: 'hello'};

map.set(o, 'content');
map.get(o);//content
map.delete(o);//true
map.has(o); //false
```
Map可以接受一个数组作为参数，数组的成员表示`[键，值]`对。
```javascript
const arr = [
    ['name', '张三'],
    ['title', 'Author']
]
const map = new Map(arr);
map.size;//2
map.has('name');//true
map.get('name');//张三
map.has('title'); //true
map.get('title');//Author

//Map接受数组做参数，其实是执行下面操作
arr.forEach(([key, value]) => map.set(key, value));
```
不仅仅是数组，只要任何具有Iterator接口切每个成员都是双元素组成的数组的数据结构，都能作Map的参数。也就是说Set和Map都可以生成新的Map
```javascript
const set = new Set([
    ['foo', 1],
    ['bar', 2]
]);
const map = new Map(set);
map.get('foo'); //1

const m1 = new Map([['foo', 3]]);
const m2 = new Map(m1);
m2.get('foo');//3

let [[a, b]] = m2;
a//foo
b//3
```
- 对同一个键多次赋值，后面的会覆盖前面你的
- 读取一个不存在的键，会返回undefined
- 如果键是引用类型，只有同一个对象的引用Map才会返回键对应的值。
- 如果键是简单类型的值，只要键 === 键，Map会视为是一个键，+0 和 -0 是一个键
- NaN虽然不等于自身，但是Map将其视作同一个键


Map 结构原生提供三个遍历器生成函数和一个遍历方法。

- keys()：返回键名的遍历器。
- values()：返回键值的遍历器。
- entries()：返回所有成员的遍历器。
- forEach()：遍历 Map 的所有成员。

Map的遍历顺序就是插入顺序！
```javascript
const map = new Map([
    ['F', 'no'],
    ['T', 'yes']
]);

for(let key of map.keys()){
    console.log(key);
}
//F
//T

for(let v of map.values()){
    console.log(v);
}
// no
// yes

for(let [k, v] of map.entries()){
    console.log(k + ':' + v);
}
//F: no
//T: yes

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
```

### 与其他数据结构转换
- Map用 ... 转为数组
- 数组通过 new Map 可以转为Map结构
- 如果Map结构的key全是字符串,可以无损转为对象。如果键名有非字符串的，那么会转为字符串再作为对象的键名
- 对象转为map，可以获取对象的key，并遍历对象，通过set方法添加map成员
- Map转JSON，如果键名是字符串，可以选择对象转为JSON；如果存在非字符串，可以选择数组转为JSON
- JSON转Map，就是上一个的逆操作

## WeakMap
WeakMap和Map类似，只要两点不同：

1. `WeakMap`只接受对象做键名（null除外），不接受其他类型的值做键名
2. `WeakMap`的键名所指向的对象，不计入垃圾回收机制。

其他暂时不看，需要是翻看原文档。