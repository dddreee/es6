# Class 的基本语法
## 1. 简介
JavaScript 语言中，生成实例对象是通过构造函数。ES6 引入了 Class 概念，作为对象的模板。
```javascript
class Point{
    constructor(x, y){
        this.x = x;
        this.y = y
    }

    toString(){
        return `(${this.x}, ${this.y})`
    }
}
```
类方法之间不需要加逗号，会报错。

ES6的类，可以看作构造函数的另一种写法，类的数据类型就是函数，类本身就指向构造函数。使用的时候，也是直接对类使用 new 命令，用法跟构造函数一致。

构造函数的 prototype 属性， 在类上也存在，类的所有方法，都是定义在类的 prototype 属性上。

在类的内部定义的方法，都是不可枚举的。

## 2. 严格模式
类和模块内部默认是严格模式，不需要使用 use strict 指定运行模式。

## 3. constructor 方法
constructor 方法是类的默认方法，通过 new 命令生成实例时，就是调用的这个方法。一个类必须有 constructor 方法，如果没有定义，那么或默认添加一个 constructor 方法。

constructor 方法默认返回实例对象， 也可以执行返回另一个对象
```javascript
class Foo{
    constructor(){
        return Object.create(null)
    }
}
new Foo() instanceof Foo; //false
```
类跟构造函数主要的区别在于， 类必须使用 new 命令，而构造函数可以直接当函数运行。

## 4. 类的实例对象
与 ES5 一样，实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）。

## 5. Class 表达式
与函数一样， 类也可以使用表达式定义
```javascript
const MyClass = class Me{
    getClassName(){
        return Me.name
    }
}
```
使用表达式定义的类需要注意的是，这个类的名字 MyClass 而不是 Me， Me 只在 Class 的内部代码可用，指代当前类
```javascript
let inst = new MyClass();
inst.getClassName(); //Me
Me.name; //报错， Me is not defined
```

如果内部没有用到的话，可以省略 Me
```javascript
const MyClass = class {

}
```

采用 Class 表达式， 能写出立即执行的 Class
```javascript
let person = new class{
    constructor(name){
        this.name = name
    }

    sayName(){
        console.log(this.name)
    }
}('张三')
persion.sayName(); // 张三
```

## 6. 不存在变量提升
```javascript
new Foo();
class Foo{} //报错
```

## 7. 私有方法和私有属性
### 现有的方法

私有方法是常见的需求，但是ES6 不提供，至鞥你通过变通方法模拟。

- 在命名上做区别
```javascript
class Widget{
    // 公有方法
    foo(baz){
        this._bar(baz)
    }
    // 私有方法
    _baz(baz){
        return this.sanf = baz
    }
}
```

- 将私有方法移除模块
```javascript
class Widget{
    foo(baz){
        bar.call(this, baz)
    }
}

function bar(baz){
    return this.sanf = baz
}
```
- 利用 Symbol 值的唯一性，将私有方法命名为一个 Symbol 值
```javascript
const bar = Symbol('bar')
const snaf = Symbol('snaf')

export default class myClass{
    foo(baz){
        this[bar](baz)
    }

    [bar](baz){
        return this[snaf] = baz
    }
}
```
bar和snaf都是Symbol值，导致第三方无法获取到它们，因此达到了私有方法和私有属性的效果。

### 私有属性的提案
有一个[提案](https://github.com/tc39/proposal-private-methods)，为 class 加了私有属性。 在属性名之前添加 # 表示私有
```javascript
calss Point{
    #x = 0;
    constructor(x = 0){
        #x = +x; //写成 this.#x 也可以
    }

    get x(){
        return #x;
    }
    set x(val){
        #x = +val
    }

    get #y(){
        return #x
    }
    set #y(v){
        #x = v
    }
}
```
- #x 就是须有属性，使用时必须带上 # ， #是属性名的一部分。
- 私有属性可以指定初始值
- 还有私有方法，同样是在方法名前加 #
- 私有属性也能设置 getter 和setter 方法

## 8. this的指向
类的方法内部如果含有 this ，它默认指向类的实例， **一旦单独使用这个方法，很可能奥错**

```javascript
class Logger{
    printName(name = 'there'){
        this.print(`Hello ${name}`)
    }
    print(text){
        console.log(text)
    }
}

const logger = new Logger();
const { printName } = logger;
printName(); // TypeError: Cannot read property 'print' of undefined
```
一个简单的方法就是在构造方法中绑定 this ，这样就不会找不到print方法了。
```javascript
class Logger{
    constructor(){
        this.printName = this.printName.bind(this)
    }
}
```

另一种就是用箭头函数
```javascript
class Logger{
    constructor(){
        this.printName = (name = 'there' => {
            this.print(`Hello ${name}`)
        })
    }
}
```

使用 Proxy， 获取方法的时候自动绑定 this。

## 9. name 属性
ES 6 的类只是 ES5 的构造函数的一层包装，所以函数的很多特性都被 Class 继承，包括 name 属性
```javascript
class Point{};
Point.name ;// Point
```
name 属性总是返回紧跟 class 关键字后面的类名

## 10. class 的取值函数 getter 和存值函数 setter
```javascript
class MyClass{
    constructor(){

    }
    get prop(){
        return 'getter'
    }

    set prop(value){
        console.log('setter: ' + value)
    }
}

let inst = new MyClass();

inst.prop = 123;

inst.prop; //getter
```
存值函数和取值函数是设置在属性的 Descriptor 对象上的。

```javascript
class CustomHTMLElement{
    constructor(element){
        this.element = element;
    }

    get html(){
        return this.element.innerHTML
    }

    set html(val){
        this.element.innerHTML = val
    }
}

var descriptor = Object.getOwnPropertyDescriptor(CustomHTMLElement.prototype, 'html')

'set' in descriptor ;//true
'get' in descriptor ; //true
```

## 11. Class 的 Generator 方法
如果方法之前有 * ，表示该方法是一个 Generator 函数

```javascript
class Foo{
    constructor(...args){
        this.args = args
    }

    *[Symbol.iterator](){
        for(let arg of this.args){
            yield arg;
        }
    }
}

for(let x of new Foo('hello', 'world')){
    console.log(x)
}
//hello
//world
```

## 12. class 的静态方法
在一个方法前，加上 static 关键字，就表示该方法不会被实例继承，而是通过类调用。这个方法被称为静态方法
```javascript
class Foo{
    static classMethod(){
        return 'hello'
    }
}
Foo.classMethod(); //hello
var foo = new Foo()
foo.classMethod() // TypeError: foo.classMethod is not a function
```

**如果静态方法包含 this 关键词， 这个 this 指向类并非实例**

```javascript
class Foo{
    static bar(){
        this.baz()
    }
    static baz(){
        console.log('hello')
    }

    baz(){
        console.log('world')
    }
}

Foo.bar(); //hello
```

父类的静态方法，可以被子类继承。
```javascript
class Foo{
    static classMethod(){
        return 'hello'
    }
}
class Bar extends Foo{

}

Bar.classMethod(); //hello
```

静态方法也可以从 super 对象上调用
```javascript
class Foo{
    static classMethod(){
        return 'hello'
    }
}

class Bar extends Foo{
    static classMethod(){
        return super.classMethod() + ', too'
    }
}

Bar.classMethod(); //hello, too
```

## 13. Class 的静态属性和实例属性
静态属性指的是 Class 本身的属性， 不是定义在实例上的属性。目前 ES6 明确规定， Class 内部只有静态方法，没有静态属性。
```javascript
class Foo{

}

Foo.prop = 1; //目前只有这种写法可行
```
目前有一个静态属性的[提案](https://github.com/tc39/proposal-class-fields), 对实例属性和静态属性都规定了新的写法。

(1). 类的实例属性。
类的实例属性可以用等式，写入类的定义中
```javascript
class MyClass{
    myProp = 42;
    constructor(){
        console.log(this.myProp)
    }

}

// 以前定义实例属性，都是写在 constructor 中
class ReactCounter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            count: 0
        }
    }
}

// 新写法定义
class ReactCounter extends React.Component{
    state = {
        count: 0
    }
}

// 
class ReactCounter extends React.Component{
    state;
    constructor(props){
        super(props)
        this.state = {
            count: 0
        }
    }
}
```

(2). 类的静态属性
加上 static 关键词即可
```javascript
class MyClass {
    static myProp = 42;
    constructor(){
        console.log(MyClass.myProp)
    }
}

//老写法
class Foo{

}
Foo.prop = 1;

//新写法
class Foo {
    static prop = 1;
}
```


### 14. new.target属性
new 是从后遭函数生成的实例对象的命令。 new.target 属性， 一般用在构造函数中，返回 new 命令的那个后遭函数。  如果构造函数不是通过 new 命令调用，那么 new.target 返回undefined。