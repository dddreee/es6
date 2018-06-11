# Generator 函数的异步应用

## 1.传统方法
- 回调函数
- 事件监听
- 发布/订阅
- Promise对象

## 2.基本概念
### 异步
异步，简单说就是一个任务不是连续完成的，，可以理解为任务被人为分成两段，先执行第一段，然后转而执行其他任务，等做好了准备，再回过头来执行第二段，

### 回调函数

### Promise

## 3. Generator 函数

### 协程
传统的编程语言，早就有异步编程的解决方案(多任务解决方案)，有一种方式叫协程，意思时多个线程相互写作，完成异步任务。
- 第一步，协程A开始执行。

- 第二部， 协程A执行到一半，进入暂停，执行权转移到协程B

- 第三步， 协程B完成之后，交还执行权。

- 第四步，协程A恢复执行。

举例：
```javascript
function* asyncJob(){
    var f = yield readFile(fileA);
}
```
上面的代码 asyncJob 时一个协程， 它的奥妙就在其中的 yield 命令。yield 命令是异步两个阶段的分界线。

协程遇到 yield 语句就得暂停， 等到执行权返回， 再从暂停的地方继续往后执行。 它的最大有点，就是代码的写法非常像同步操作，如果去除 yield 命令， 一摸一样。

### 协程的 Generator 函数实现
Generator 函数是协程在ES6的实现，最大的特点是交出函数的执行权。

整个 Generator 函数就是一个封装的异步任务，遇到yield 语句，就会暂停。
```javascript
function* gen(x){
    var y = yield x + 2;
    return y;
}

var g = gen(1);
g.next();
g.next();
```
上面代码调用 Generator 函数，返回一个内部指针 g， Generator 函数不会返回结果，返回的是指针对象。调用指针 g 的 next 方法，会将指针指向 yield 语句。

next 方法的作用是分阶段执行 Generator 函数。

### Generator 函数的数据交换和错误处理
Generator 函数可以暂停和恢复执行，此外还有两个特性：函数体内外的数据交换和错误处理机制。

next 返回值的value 属性， 是Generator 函数向外输出数据； next 方法还能接受参数，像 Generator 函数体内输入数据。
```javascript
function* gen(x){
    var y = yield x + 2;
    return y;
}
var g = gen(1);
g.next(); // {value: 3, done: false}
g.next(2); // {value: 2, done: true}
```

Generator 函数体内还能部署错误处理代码，捕获函数体外抛出的错误。
```javascript
function* gen(x){
    try{
        var y = yield x + 2;
    } catch (e){
        console.log(e)
    }

    return y;
}
var g = gen(1);
g.next(1);
g.next()
g.throw('出错了')
```

指针对象的 throw 方法抛出的错误，可以被函数体内的 try...catch 代码块捕获，这意味着，出错的代码与处理错误的代码，实现了时间和空间上的分离，这对于异步变成无疑很重要。

### 异步任务的封装
```javascript
var fetch = require('node-fetch')
function* gen(){
    var url = 'https://api.github.com/user/github';
    var result = yield fetch(url);
    console.log(result.bio);
}
```
上面代码， Generator 函数封装了一个异步操作，该操作先读取一个远程接口，然后从JSON 格式的数据解析信息。
执行这段代码的方法如下：
```javascript
var g = gen();
var result = g.next();

result.value.then(function(data){
    return data.json()
}).then(function(data){
    g.next(data)
});
```
由于 Fetch 模块返回的是一个Promise 对象，因此用then方法调用下一个next方法。

虽然 Generator 函数将异步操作表示的很简洁，但是流程管理却不方便（即何时执行第一阶段，何时执行第二阶段）

## 4. Thunk 函数
Thunk 函数是自动执行 Generator 函数的一种方法。

### 参数的求值策略
```javascript
var x = 1;

function f(m){
    return m * 2;
}

f(x + 5);
```
一种意见是"传值调用"，即在进入函数体之前，就计算 x + 5 的值，再将这个值传入函数 f ，C 语言采用这种策略。另一种意见是"传名调用"， 即将表达式 x + 5 传入函数体，只有用到的时候求值， Haskell 就是这种策略。
```javascript
f(6)// 传值调用

f(x + 5)//传名调用
```
传值调用比较简单，但是对参数求值的时候，实际上还没用到这个参数，有可能造成性能损失。
```javascript
function f(a, b){
    return b;
}
f(3 * x * x - 2 * x - 1, x);
```
上面代码中，函数f的第一个参数是一个复杂的表达式，但是函数体内并没有用到。对于这个参数求值，实际上是比不要的，因此有一些计算机学家倾向于 "传名调用"，只在执行时求值。

### Thunk 函数的含义
编译器的"传名调用"实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体，这个临时函数就叫 Thunk 函数。

```javascript
function f(m){
    return m * 2;
}
f(x + 5);

//等用于
var thunk = function(){
    return x + 5;
}
function f(thunk){
    return thunk() * 2
}
```
上面代码中，函数 f 的参数 x + 5 被一个函数替换的， 凡是用到原参数的地方， 对 Thunk 函数求值即可。

这就是 Thunk 函数的定义，他是"传名调用"的一种实现策略，用来替换某个表达式。

### JavaScript 语言的 Thunk 函数
JavaScript 语言是传值调用， 它的Thunk 函数含义有所不同。再JavaScript 中， Thunk 函数替换的不是表达式，而是多参数函数，将其替换成一个只接受回掉函数作为参数的单参数函数。
```javascript
fs.readFile(fileName, callback);

//Thunk 版本的readFile
var Thunk = function(fileName){
    return function (callback){
        return fs.readFile(fileName, callback);
    }
}
var readFileThunk = Thunk(fileName);
readFileThunk(callback);
```
fs 模块的 readFile 方法本是一个多参数函数，经过转换器处理，变成一个单参数函数，只接受回调函数做参数。这个单参数版本，就叫做 Thunk 函数。

任何函数，只要参数有回掉函数，就能写成Thunk函数的形式。
```javascript
var Thunk = function(fn){
    return function(){
        var args = Array.prototype.slice.call(arguments);

        return function(callback){
            args.push(callback);
            return fn.apply(this, args);
        }
    }
}

// ES6版本
const Thunk = function(fn){
    return function(...args){
        return function(callback){
            return fn.call(this, ...args, callback)
        }
    }
}
```
使用上面的转换器，生成 fs.readFile 的Thunk 函数
```javascript
var readFileThunk = Thunk(fs.readFile);
readFile(fileA)(callback);
```

下面是另一个完整的例子。
```javascript
function f(a, cb){
    cb(a);
}
const ft = Thunk(f);
ft(1)(console.log); //1
```
### Thunkify 模块
生产环境的转换器，建议使用Thunkify 模块。
首先安装
```javascript
npm install thunkify
```
使用方式
```javascript
var thunkify = require('thunkify');
var fs = require('fs');

var read = thunkify(fs.readFile);
read('package.json')(function(err, str){
    //...
})
```
Thunkify 源码与上面的那个简单的转换器非常想
```javascript
function thunkify(fn){
    return function(){
        var args = new Array(arguments.length);
        var ctx = this;
        for(var i = 0 ; i < args.length ; ++i){
            args[i] = arguments[i]
        }

        return function(done){
            var called;
            args.push(function(){
                if(called) return;
                called = true;
                done.apply(null, arguments)
            });

            try {
                fn.apply(ctx, args);
            } catch(err){
                done(err);
            }
        }
    }
}
```
源码主要多了一个检查机制，变量 called 确保回调函数之运行一次， 这样的设计与下文的 Generator 函数相关。

```javascript
function f(a, b, callback){
    var sum = a + b;
    callback(sum);
    callback(sum)
}
var ft = thunkify(f);
var print = console.log.bind(console);
ft(1, 2)(print); //3
```
上面代码， thunkify 只允许回调函数执行一次。

### Generator 函数的流程管理

Thunk 函数以前没什么用，但是有了 Generator 函数之后， Thunk 函数可以用于 Generator 函数的自动流程管理。
```javascript
function* gen(){

}

var g = gen();
var res = g.next();
while(!res.done){
    console.log(res.value);
    res = g.next()
}
```
但是这不适合异步操作。如果必须保证前一步执行完，才能执行后一部，上面的自动执行就不可行。这是 Thunk 函数就排上用处了。
```javascript
var fs = require('fs')
var thunkify = require('thunkify');
var readFileThunk = thunkify(fs.readFile);

var gen = function* (){
    var r1 = yield readFileThunk('/etc/fstab');
    console.log(r1.toString());
    var r2 = yield readFileThunk('/etc/shells');
    console.log(r2.toString())
};
var g = gen();
var r1 = g.next();
r1.value(function(err, data){
    if(err) throw err;

    var r2 = g.next(data);
    r2.value(function(err, data){
        if err throw err;
        g.next(data)
    })
})
```
上面代码中，变量g是 Generator 函数的内部指针，表示目前执行到哪一步。next方法负责将指针移动到下一步，并返回该步的信息（value属性和done属性）。

仔细查看上面的代码，可以发现 Generator 函数的执行过程，其实是将同一个回调函数，反复传入next方法的value属性。这使得我们可以用递归来自动完成这个过程。

### Thunk 函数的自动流程管理
Thunk 函数的真正的威力，在于可以自动执行 Generator 函数。
```javascript
function run (fn){
    var gen = fn();
    function next(err, data){
        var result = gen.next(data);
        if(result.done) return;
        result.value(next)
    }
}

function* gen(){
    var f1 = yield readFileThunk('fileA');
    var f2 = yield readFileThunk('fileB');
    // ...
    var fn = yield readFileThunk('fileN');
}
run(g);
```
上面代码的run函数，就是一个 Generator 函数的自动执行器。内部的next函数就是 Thunk 的回调函数。next函数先将指针移到 Generator 函数的下一步（gen.next方法），然后判断 Generator 函数是否结束（result.done属性），如果没结束，就将next函数再传入 Thunk 函数（result.value属性），否则就直接退出。

有了这个执行器，执行 Generator 函数方便多了。不管内部有多少个异步操作，直接把 Generator 函数传入run函数即可。当然，前提是每一个异步操作，都要是 Thunk 函数，也就是说，跟在yield命令后面的必须是 Thunk 函数。

上面代码中，函数g封装了n个异步的读取文件操作，只要执行run函数，这些操作就会自动完成。这样一来，异步操作不仅可以写得像同步操作，而且一行代码就可以执行。

Thunk 函数并不是 Generator 函数自动执行的唯一方案。因为自动执行的关键是，必须有一种机制，自动控制 Generator 函数的流程，接收和交还程序的执行权。回调函数可以做到这一点，Promise 对象也可以做到这一点。

## 5. co 模块

emmm 下面的懒得写了。。
