# async 函数
async 函数是Generator 函数的语法糖。async 函数就是将 Generator 函数的 * 替换成 async， yield 替换成 await。async 函数对 Generator 函数的改进，体现为一下四点
- (1) 内置执行器
Generator 函数的执行必须靠执行器，所以有了co模块，而async 函数自带执行器， async 函数与普通函数一样调用。
```javascript
asyncReadFile()
```

- (2) 更好的语义
async 和 await ，比起 * 与 yield， 语义更清楚， async 表示函数里有异步操作， await 表示紧跟再后面的表达式需要等待结果。

- (3) 更好的适用性
co 模块约定， yield 命令后面只能是 Thunk 函数或 Promise 对象， 而 await 命令后面， 可以是 Promise 对象和原始类型的值

- (4) 返回值是 Promise
async 函数返回值是 Promise 对象， 可以用 then 方法执行下一步。

进一步说 async 函数完全可以看作多个异步操作， 包装成一个 Promise 对象， 而 await 命令就是内部的 then 命令语法糖。

## 2.基本用法

async 函数返回一个 Promise 对象， 可以使用 then 方法添加回调函数。 当执行的时候，一遇到 await 就会先返回， 等到异步操作完成， 再接着执行函数体内后面的语句
```javascript
function timeout(ms){
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
async function asyncPrint(value, ms){
    await timeout(ms);
    console.log(value);
}
asyncPrint('hello', 50)
```
上面的代码 50 毫秒后输入 hello

由于 async 函数返回的是 Promise 函数，可以作为 await 命令的参数。因此上面的例子可以这样写
```javascript
async function timeout(ms){
    await new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}
async function asyncPrint(value, ms){
    await timeout(ms);
    console.log(value)
}
asyncPrint('hello world', 50)
```

async 函数的多种使用方式
```javascript
// 函数声明
async function foo(){}

// 函数表达式
const foo = async function(){

}

// 对象的方法
let obj = {
    async foo(){

    }
}
obj.foo().then()

// Class的方法
class Storage{
    constructor(){
        this.cachePromise = caches.open('avatars')
    }

    async getAvatar(name){
        const cache = await this.cachePromise;
        return cache.match(`/avatars/${name}.jpg`)
    }
}
const storage = new Storage();
storage.getAvatar('jake').then()

// 箭头函数
const foo = async () => {}
```

## 3. 语法
async 函数返回一个 Promise 对象。 async 函数内部 return语句返回的值， 会成为 then 方法回调函数的参数。
```javascript
async function f(){
    return 'hello'
}
f().then( v = > console.log(v)); // hello
```
async 函数内部抛出错误，会导致返回的 Promise 对象变为 reject 状态， 抛出的错误会被 catch 方法回调函数接收到
```javascript
async function f(){
    throw new Error('error')
}
f().then(
    v => console.log(v),
    e => console.log(e);
)
//Error: error
```
### Promise 状态变化
async 函数返回的 Promise 对象，必须等到内部所有 await 后面的表达式或者其他对象执行完， 才会发生状态，除非遇到 return 语句或者抛出错误。只有 sync 函数内部的异步操作执行完， 才会执行then 方法。

### await 命令
正常情况下， await 命令后面是一个 Promise 对象。如果不是，会被转成一个立即 resolve的 Promise对象。

await 命令后面的 Promise 对象如果变成 reject 状态， 那么 reject 的参数会被 catch 方法的回调函数接收到。
```javascript
async function f(){
    await Promise.reject('出错了')
}
f().then(v => console.log(v)).catch(e => console.log(e)); //出错了
```
只要一个 await 语句后面的 Promise 变为 reject， 那么整个 async 函数都会中断执行。有时我们希望即使前一个异步操作失败，也不要中断后面的异步操作，此时我们能将 await 放在 try...catch 结构里面。

### 错误处理
如果await 后面的异步操作出错了， 那么等同于 async 函数返回的 Promise 对象被 reject。

防止出错的方法就是将其放在try...catch 代码块中
```javascript
async function f(){
    try {
        const val1 = await firstStep();
        const val2 = await secondStep(val1);
        const val3 = await thirdStep(val2);

        console.log(`final: ${val3}`)
    }catch(e){
        console.error(e)
    }
}

const superagent = require('superagent')
const NUM_RETRIES = 3;
async function test(){
    let i ;
    for(i = 0 ; i < NUM_RETRIES; ++i){
        try {
            await superagent.get('http://google.com/this-throws-an-error');
            break;
        }catch(e){

        }
    }
    console.log(i)
}

test()
```
上面的代码，如果await操作成功，就是使用 break 语句退出循环； 如果失败就会进入下一个循环。

### 使用注意点
- await 命令后面的Promise对象，运行结果可能是 rejected ， 最好把 await 命令放在 try...catch 代码块中

- 多个 await 命令后面的异步操作，不存在继发关系， 最好让它们同时出发。
```javascript
let foo = await getFoo();
let bar = await getBar();

// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// 写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;
```

- await 命令只能再 async 函数中使用，如果用在普通函数， 会报错。

## 4. async 函数的实现原理
async 函数的实现原理，就是将 Generator 函数和自动执行器， 包装在一个函数里。
```javascript
async function fn(args){
    //...
}
function fn(args){
    return spawn(function* (){

    })
}
```
所有的async 函数都可以写成上面的第二种形式， spawn是自动执行其。
```javascript
function apawn(genF){
    return new Promise(function(resolve, reject){
        const gen = genF();

        function step(nextF){
            let next;
            try{
                next = nextF()
            }catch(e){
                return reject(e)
            }

            if(next.done){
                return resolve(next.value)
            }
            Promise.resolve(next.value).then(function(v){
                step(function(){
                    return gen.next(v)
                })
            }, function(e){
                step(function(){
                    return gen.throw(e)
                })
            });
        }

        step(function(){
            return gen.next(undefined)
        })
    })
}
```

## 5.与其他异步处理方法的比较
一个例子，某个DOM元素上面，部署了一系列动画，前一个结束才开始后一面，如果有一个动画出错，就不再往下执行，返回上一个成功执行的动画的返回值。

1.Promise
```javascript
function chainAnimationsPromise(elem, animations){
    let ret = null;

    let p = Promise.resolve();

    for(let anim of animations){
        p = p.then(function(val){
            ret = val;
            return anim(elem)
        })
    }
    return p.catch(function(e){

    }).then(function(){
        return ret;
    })
}
```
Promise的写啊比回调函数好看些，但是语义上不明显

2. Generator 函数
```javascript
function chainAnimaionsGenerator(elem, animations){
    return spawn(function*(){
        let ret = null;
        try{
            for(let anim of animations){
                ret = yield anim(elem)
            }
        }catch(e){

        }
        return ret
    })
}
```
上面代码使用 Generator 函数遍历了每个动画，语义比 Promise 写法更清晰，用户定义的操作全部都出现在spawn函数的内部。这个写法的问题在于，必须有一个任务运行器，自动执行 Generator 函数，上面代码的spawn函数就是自动执行器，它返回一个 Promise 对象，而且必须保证yield语句后面的表达式，必须返回一个 Promise。

3. async 函数
```javascript
async function chainAnimationsAsync(elem, animations){
    let ret = null;
    try{
        for(let anim of animations){
            ret = await anim(elem)
        }
    }catch(e){

    }

    return ret
}
```
可以看到 Async 函数的实现最简洁，最符合语义，几乎没有语义不相关的代码。它将 Generator 写法中的自动执行器，改在语言层面提供，不暴露给用户，因此代码量最少。如果使用 Generator 写法，自动执行器需要用户自己提供。

## 6. 实例：按顺序完成异步操作
实际开发中，经常遇到一组异步操作，需要按照顺序完成。

Promise 写法
```javascript
function logInOrder(urls){
    const textPromises = urls.map(url => {
        return fetch(url).then(res => res.text())
    })

    textPromises.reduce((chain, textPromise) => {
        return chain.then(() => textPromise).then(text => console.log(text))
    }, Promise.resolve())
}
```
上面的代码使用 fetch 方法， 同时远程读取一组 URL ， 每个 fetch 操作都返回一个 Promise 对象， 放入 textPromises 数组， 然后用 reduce 方法依次处理每个 Promise 对象， 然后再使用 then ， 将所有的 Promise 对象连起来。

用 async 实现
```javascript
async function logInOrder(urls){
    for(const url of urls){
        const res = await fetch(url);
        console.log(await res.text());
    }
}
```
上面的代码虽简化了，但是所有的远程操作都是继发的，效率比较差，我们可以并发发出远程请求。
```javascript
async function logInorder(urls){
    const textPromises = urls.map(async url => {
        const res = await fetch(url);
        return res.text();
    })
    for(const textPromise of textPromises){
        console.log(await textPromise)
    }
}
```

## 7. 异步遍历的接口
TODO： ES2018的内容。。暂时不看了。