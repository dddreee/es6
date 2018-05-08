
# Iterator 和 for...of 循环
## 1. Iterator（遍历器）概念
JavaScript 原有的表示集合的数据结构，主要是数组和对象，ES6又添加了 Set 和 Map 。用户可以组合使用它们，定义自己的数据结构，比如数组的成员是 Map ，Map 的成员又是对象。这样就需要一种统一的接口机制，来处理所有不同的数据结构。

遍历器（Iterator）就是这样一种机制。它是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。

`Iterator` 的作用有三个：一是为各种数据结构，提供一个统一的、简便的访问接口；二是使得数据结构的成员能够按某种次序排列；三是 ES6 创造了一种新的遍历命令 `for...of` 循环， `Iterator` 接口主要供 `for...of` 消费。

Iterator遍历过程：
1. 创建一个指针对象，指向当前数据结构的起始位置。遍历器对象本质上就是一个指针对象。

2. 第一次调用指针对象的 `next` 方法，可以将指针指向数据结构的第一个成员。

3. 第二次调用指针对象的 `next` 方法，指针就指向数据结构的第二个成员。

4. 不断的调用指针对象的 `next` 方法，知道它指向数据结构的结束为止。

每次调用 `next` 方法，都会返回一个包含 `value` 和 `done` 两个属性的对象。 `value` 属性是当前成员的值， `done` 属性是一个布尔值，表示遍历是否结束。

下面模拟next方法返回值的例子
```javascript
var it = makeIterator(['a', 'b']);

it.next() //{value: 'a', done: false}
it.next() //{value: 'b', done: false}
it.next() //{value: undefined, done: true}

function makeIterator(array){
    var nextIndex = 0;
    return {
        next: function(){
            return nextIndex < array.length ?
                { value: array[nextIndex++], done: false }:
                { value: undefined, done: true };
        }
    }
}
```
`next` 方法返回一个对象，表示当前数据成员的信息。这个对象具有 `value` 和 `done` 两个属性， `value` 属性返回当前位置的成员， `done` 属性是一个布尔值，表示遍历是否结束，即是否还有必要再一次调用 `next` 方法。

总之，调用指针对象的 `next` 方法，就可以遍历事先给定的数据结构。

对于遍历器对象来说，`done: false` 和 `value: undefined` 属性都是可以省略的，因此上面的 `makeIterator` 函数可以简写成下面的形式。
```javascript
function makeIterator(array){
    var nextIndex = 0;
    return {
        next: function(){
            return nextIndex < array.length ? { value: array[nextIndex++] } : { done: true };
        }
    };
};
```
由于 `Iterator` 只是把接口规格加到数据结构之上，所以，遍历器与它所遍历的那个数据结构，实际上是分开的，完全可以写出没有对应数据结构的遍历器对象，或者说用遍历器对象模拟出数据结构。下面是一个无限运行的遍历器对象的例子。

```javascript
var it = idMaker();

it.next().value // 0
it.next().value // 1
it.next().value // 2
// ...

function idMaker() {
  var index = 0;

  return {
    next: function() {
      return {value: index++, done: false};
    }
  };
}
```
上面的例子中，遍历器生成函数idMaker，返回一个遍历器对象（即指针对象）。但是并没有对应的数据结构，或者说，遍历器对象自己描述了一个数据结构出来。

## 2. 默认Iterator接口
一种数据结构只要部署了 Iterator 接口，我们就称这种数据结构是“可遍历的”（iterable）。

ES6规定，默认的 `Iterator` 接口部署在数据结构的 `Symbol.iterator` 属性。或者说只要数据结构有 `Symbol.iterator` 属性，就能认为是可遍历的。 `Symbol.iterator` 属性本身是一个函数，就是当前数据结构默认的遍历器生成函数。执行这个函数，就会返回一个遍历器。至于属性名 `Symbol.iterator` ，它是一个表达式，返回 `Symbol` 对象的 `iterator` 属性，这是一个预定义好的、类型为 `Symbol` 的特殊值，所以要放在方括号内（参见《Symbol》一章）。
```javascript
const obj = {
    [Symbol.iterator]: function(){
        return {
            next: function(){
                return {
                    value: 1,
                    done: true
                }
            }
        }
    }
}
```
原生具备 Iterator 接口的数据：
- Array
- Map
- Set
- String
- TypeArray
- 函数的arguments对象
- NodeList 对象

下面是数组的 Symbol.iterator 属性
```javascript
let arr = ['a', 'b', 'c'];
let iter = arr[Symbol.iterator]();

iter.next(); //{value: 'a', done: false}
iter.next(); //{value: 'b', done: false}
iter.next(); //{value: 'c', done: false}
iter.next(); //{value: undefined, done: true}
```
对于原生部署Iterator 接口的数据结构，for...of循环会自动遍历它们。除此之外，其他数据结构的Iterator接口，都需要自己在Symbol.iterator属性上面部署，这样才会被for...of 循环遍历。

对象（Object）之所以没有默认部署 Iterator 接口，是因为对象的哪个属性先遍历，哪个属性后遍历是不确定的，需要开发者手动指定。本质上，遍历器是一种线性处理，对于任何非线性的数据结构，部署遍历器接口，就等于部署一种线性转换。不过，严格地说，对象部署遍历器接口并不是很必要，因为这时对象实际上被当作 Map 结构使用，ES5 没有 Map 结构，而 ES6 原生提供了。

一个对象如果要具备可被for...of循环调用的 Iterator 接口，就必须在Symbol.iterator的属性上部署遍历器生成方法（原型链上的对象具有该方法也可）。

```javascript
class RangeIterator{
    constructor(start, stop){
        this.value = start;
        this.stop = stop;
    }
    [Symbol.iterator](){
        return this;
    }

    next(){
        var value = this.value;
        if(value < this.stop){
            this.value ++;
            return {
                done: false,
                value: value
            }
        }
        return {
            done: true,
            value: undefined
        }
    }
}

function range(start, stop){
    return new RangeIterator(start, stop);
}
for(var value of range(0, 3)){
    console.log(value); //0, 1, 2
}
```

下面是通过遍历器实现指针结构的例子
```javascript
function Obj(value){
    this.value = value;
    this.next = null;
}

Object.prototype[Symbol.iterator] = function(){
    var iterator = {
        next: next
    }

    var current = this;

    function next(){
        if(current){
            var value = current.value;
            current = current.next;
            return {
                done: false,
                value: value
            }
        }else {
            return {
                done: true
            }
        }
    }

    return iterator
}

var one = new Obj(1);
var two = new Obj(2);
var three = new Obj(3);

one.next = two;
two.next = three;

for(var i of one){
    console.log(i);//1 2 3
}
```
上述代码首先在构造函数的原型链上部署`Symbol.iterator`方法， 调用该方法会返回遍历器对象`iterator`，调用该对象的next方法，返回一个值的时候，自动将内部指针指向下一个实例。

下面是另一个为对象添加`Iterator`接口
```javascript
let obj = {
    data: ['hello', 'world'],
    [Symbol.iterator](){
        const self = this;
        let index = 0;
        return {
            next(){
                if( index < self.data.length){
                    return {
                        value: self.data[index++],
                        done: false
                    }
                }else{
                    return {
                        value: undefined,
                        done: true
                    }
                }
                
            }
        }
    }
}
```

对于类似数组的对象(存在数值键名和 `length` 属性),部署 `Iterator` 接口，有一个简便方法，就是 `Symbol.iterator` 方法直接引用数组的 `Iterator` 接口。
```javascript
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
// 或者
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];

[...document.querySelectorAll('div')]//就可以执行了
```
`NodeList` 对象是类似数组的对象，本来就具有遍历接口，可以直接遍历。上面代码中，我们将它的遍历接口改成数组的 `Symbol.iterator` 属性，可以看到没有任何影响。