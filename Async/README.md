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
```