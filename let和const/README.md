## `let`
-------


### `let`声明的变量只在当前作用域有效
```javascript
for(let i = 0 ; i < 3 ; i++){
    let i = 'abc';
    console.log(i);
}
//输出3次abc,因为内部变量i与循环变量i不在同一个作用域。
```
***

### `let`不存在变量提升

`var` 命令会发生”变量提升“现象, 而`let`一定得在声明并且赋值之后再使用，否则会报错。

```javascript
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```
***
### 暂时性死区
只要块级作用域内存在`let`命令，那么它声明的变量就绑定了这个区域,不再受外部的影响。
```javascript
var a = 'temp'

if(true){
    a = 'test';//ReferenceError
    let a;
}
```

<b>只要通过`let`和`const`声明的变量，必须在声明之后使用，即使外部存在同名变量，都会报错</b>

其他隐蔽的死区
```javascript
function foo(x = y, y = 2){
    return [x, y]
}
foo(); //报错, x = y时，y没有声明

function bar(x = 2, y = x){
    return [x, y]
}
bar(); //[2, 2]

let x = x;//ReferenceError
```

***
### 不允许重复声明
`let`不允许在相同作用域内，重复声明同一个变量。
```javascript
{
    var a = 1;
    let a = 1;

}
{
    let a = 10;
    let a = 1;
}

function foo(arg){
    let arg;
}
//上面几种声明全会报错

function(arg){
    {
        let arg;//不报错
    }
}
```
***
## 块级作用域

    es5只有全局作用域和函数作用域，这就带来了很多不合理的场景。
```javascript
//场景一：内层变量覆盖外层变量
var date = new Date();
function f(){
    console.log(date)
    if(false){
        var date = '2000012312';
    }
}
f(); //undefined
//因为变量提升，再函数作用域顶部会优先声明局部变量date，覆盖了全局变量

//场景二： 用来计数的循环变量泄露为全局变量
var s = 'hello';
for(var i = 0 ; i < s.length ; i++){

}
console.log(i);//5
```
***
### es6的块级作用域
`let`为JavaScript增加了块级作用域
```javascript
function f(){
    let n = 5;
    if(true){
        let n = 10;
    }
    console.log(n); //5
}
```
外层代码块不受内层代码块的影响，如果两个都是`var`声明的变量，则输出10

`es6`的代码块允许任意嵌套
```javascript
{{{{{{{let a = 10}}}}}}}

{{{{{{
    {let b = 'test'}
    console.log(b); //报错 外层作用域无法读取内层作用域的变量
}}}}}}
```
