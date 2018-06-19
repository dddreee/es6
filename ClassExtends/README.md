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

另外再子类的构造函数中， 必须调用 super 方法之后，才能使用 this 关键字。 子类实例的构建时基于对父类实例的加工。

父类的静态方法也会被子类继承。

## 2. Object.getPrototypeOf()

Object.getPrototypeOf 方法可以从子类上获取父类
```javascript
Object.getPrototypeOf(ColorPoint) === Point; //true
```

## 3. super 关键字
super 关键字既可以当函数使用，也可以当对象用。
- super 作为函数调用时，代表父类的构造函数。 ES6 要求， 子类的构造函数必须执行一次 super 函数。

super 虽然代表了父类的构造函数，但是返回的是子类的实例。 super 内部的 this指的是B， 因此 super() 在这里相当于 A.prototype.constructor.call(this)
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
作为函数时， super 只能在子类的构造函数之中。

- super 作为对象，在普通方法中，指向父类的原型对象； 在静态方法中，指向父类。
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
子类 B 中的 super.p(), 就是将 super 作为对象使用， 此时 super 在普通方法中指向 A.prototype。

需要注意的是，super 指向的是父类的 prototype 对象， 定义在父类实例上的方法或属性无法通过 super 调用

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

在静态方法中， super 指向父类。
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
    
}
```