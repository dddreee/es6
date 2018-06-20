# Class 的继承
## 1.简介
Class 可以通过 extends 关键字实现继承。
```javascript
class Point{

}
class ColorPoint extends Point{
    constructor(x, y, color){
        super(x, y);
        this.color = color;
    }
}
```

子类必须在 constructor 方法中调用 super 方法，否则新建实例时会报错。这是因为子类自己的 this 对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法，如果不调用 super 方法，子类就得不到 this 对象。

ES5的继承，实质时先创造子类的实例对象 this ， 然后将父类的方法添加到 this 上面（ Parent.apply(this) ） 。 ES6 的继承机制不同，先创造父类的实例对象 this， 所以必须先调用 super 方法，然后再用子类的构造函数修改 this。

如果子类没有定义 constructor 方法，这个方法会被默认添加，包括 super 方法。如果显示定义了这方法，但是没有调用 super 方法，会报错。
```javascript
class ColorPoint extends Point{

}

// 等同于
class ColorPoint extends Point{
    constructor(...args){
        super(...args)
    }
}
```

另外再子类的构造函数中， 必须调用 `super` 方法之后，才能使用 `this` 关键字。 子类实例的构建时基于对父类实例的加工。

父类的静态方法也会被子类继承。

## 2. Object.getPrototypeOf()

`Object.getPrototypeOf` 方法可以从子类上获取父类
```javascript
Object.getPrototypeOf(ColorPoint) === Point; //true
```

## 3. super 关键字
`super` 关键字既可以当函数使用，也可以当对象用。
- `super` 作为函数调用时，代表父类的构造函数。 `ES6` 要求， 子类的构造函数必须执行一次 `super` 函数。

`super` 虽然代表了父类的构造函数，但是返回的是子类的实例。 `super` 内部的 `this` 指的是 `B`， 因此 `super()` 在这里相当于 `A.prototype.constructor.call(this)`
```javascript
class A{
    constructor(){
        console.log(new.target.name)
    }
}
class B extends A {
    constructor(){
        super()
    }
}
new B(); //B
new A(); //A
```
作为函数时， `super` 只能在子类的构造函数之中。

- `super` 作为对象，在普通方法中，指向父类的原型对象； 在静态方法中，指向父类。
```javascript
class A {
    p(){
        return 2
    }
}

class B extends A {
    constructor(){
        super();
        console.log(super.p())
    }
}

let b = new B(); // 2
```
子类 B 中的 `super.p()`, 就是将 `super` 作为对象使用， 此时 `super` 在普通方法中指向 `A.prototype`。

需要注意的是， `super` 指向的是父类的 prototype 对象， 定义在父类实例上的方法或属性无法通过 `super` 调用

```javascript
class A {
    constructor(){
        this.p = 2
    }
}

class B extends A {
    get m(){
        return super.p
    }
}
let b = new B();
b.m ; //undefined

A.prototype.p = 3;
b.m; //3
```
如果定义在 父类的原型上就能获取到。

```javascript
class A{
    constructor(){
        this.x = 1
    }
    print(){
        console.log(this.x)
    }
}

class B extends A {
    constructor(){
        super();
        this.x = 2;
    }
    m(){
        super.print()
    }
}
let b = new B();
b.m() ;// 2
```
`super.print()` 虽然调用的是 `A.prototype.print()` , 但是 `A.prototype.print()` 的内部的 `this` 指向的是 `B` 的实例，导致输出的是2， 实际上执行的是 `super.print.call(this)`。

由于 `this` 指向子类实例， 所以通过 super 对某个属性赋值，这时 super 就是 this ， 赋值的属性会变成子类实例的属性。
```javascript
class A {
    constructor(){
        this.x = 1
    }
}

class B extends A {
    constructor(){
        super();
        this.x = 2;
        super.x = 3;
        console.log(super.x); //undefined
        console.log(this.x); //3
    }
}
```

在静态方法中， `super` 指向父类。
```javascript
class Parent {
    static myMethod(msg){
        console.log('static', msg)
    }

    myMethod(msg){
        console.log('instance', msg)
    }
}

class Child extends Parent {
    static myMethod(msg){
        super.myMethod(msg)
    }

    myMethod(msg){
        super.myMthod(msg)
    }
}
Child.myMethod(1); //static 1
new Child().myMethod(2); // instance 2
```
另外在子类的静态方法中通过 `super` 调用父类方法时，方法内部的 `this` 指向当前子类，而非子类的实例。
```javascript
class A {
    print(){
        console.log(this.x)
    }
}
class B extends A {
    constructor(){
        super();
        this.x = 1;
    }
    static m(){
        super.print()
    }
}
B.m(); //undefined

B.x = 3
B.m(); //3
```

---
### 总结下：
- `super` 作为函数。
    - 只能在子类的 `constructor` 方法中调用
    - `super()` 执行时， 内部的 this 指向 B的构造函数。。或者说是 `A.prototype.constructor.call(this)`

- `super`作为对象
    - 在普通方法中
        - `super` 指向父类的原型，定义在父类实例上的方法或属性无法通过 super 调用
        - 通过 `super` 调用父类的方法，方法内部的 `this` 指向当前的子类实例
        - 通过 `super` 对某个属性赋值， 此时 `super` 就是 `this，` 赋值的属性会变成子类实例的属性
    - 在静态方法中
        - `super` 指向父类
        - **在子类的静态方法中通过 `super` 调用父类的静态方法时，方法内部的 `this` 指向当前的子类，而非子类的实例**

使用 `super` 的时候，必须显示的指定作为函数还是对象使用。否则会报错
```javascript
class A {

}
class B extends A {
    constructor(){
        super();
        console.log(super); //报错
    }
}
```

上面的代码会报错，因为系统无法将 super 当作对象还是函数。

`super.valueOf()` 表明 `super` 时一个对象，由于 `super` 使得 `this` 指向 `B` 的实例， 所以 `super.valueOf()` 返回的是一个 `B` 的实例。


## 4. 类的 prototype 属性和 `__proto__` 属性
大多数浏览器的 ES5 实现中， 每一个对象都有 `__proto__`属性，指向对应的构造函数的 prototype 属性。 Class 作为构造函数的语法糖， 同时有 `prototype` 属性和 `__proto__` 属性，因此存在两条继承连

1. 子类的 `__proto__` 属性，表示构造函数的继承，总是指向父类。
2. 子类的 `prototype` 属性的 `__proto__` 属性， 表示方法的继承，总是指向父类的 `prototype` 属性
```javascript
class A{

}
class B extends A {}

B.__proto__ === A; // true
B.prototype.__proto__ === A.prototype ; //true

// 实现方式
class A {

}
class B {

}
// B的实例继承 A 的实例
Object.setPrototypeOf(B.prototype, A.prototype)

// B 继承 A 的静态属性
Object.setPrototypeOf(B, A)

```

可以这样理解
 - 作为一个对象，子类 `B` 的原型是父类 `A` 
 - 作为一个构造函数， 子类 `B` 的原型对象是父类 `A` 的原型对象的实例


 ### `extends` 的继承目标
 `extends` 关键字后面可以跟多种类型的值
 - 第一种特殊情况，子类继承 `Object` 类
 - 第二种特殊情况，不存在任何继承
 - 第三种特殊情况，子类继承 `null`

 ### 实例的 `__proto__` 属性
 子类实例的 `__proto__` 属性的 `__proto__` 指向父类实例的 `__proto__` 属性。也就是说 子类的原型的原型，是父类的原型
 ```javascript
class A{}
class B extends A {}
let a = new A()
let b = new B();

B.prototype instanceof A; //true
B.prototype.__proto__ === A.prototype === b.__proto__.__proto__ === a.__proto__; //true

a.__proto__ === A.prototype
b.__proto__ === B.prototype

B.__proto__ === A
b.__proto__.__proto__ === a.__proto__
 ```

 ## 5. 原生构造函数的继承
 - Boolean()
 - Number()
 - String()
 - Array()
 - Date()
 - Function()
 - RegExp()
 - Error()
 - Object()

 以前这些构造函数是无法继承。比如不能自己定义一个 Array 的子类
 ```javascript
function MyArray(){
    Array.apply(this, arguments)
}

MyArray.prototype = Object.create(Array.prototype, {
    constructor: {
        value: MyArray,
        writable: true,
        configurable: true,
        enumerable: true
    }
})
 ```
 上面定义了一个继承 Array 的 MyArray 类。但是这个类的行为与 Array 完全不一致
 ```javascript
var colors = new MyArray();
colors[0] = 'red';
colors.length; //0

colors.length = 0;
colors[0]; //'red'
 ```

 ---
 划重点。。 下面的有点麻烦
