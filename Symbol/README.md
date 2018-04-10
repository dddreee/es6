# Symbol

## 概述
1. Symbol是独一无二的值
2. Symbol不能使用`new`操作符,会报错
3. 可以接受一个字符串做参数，表示对Symbol实例的描述，方便在控制台输出或者转成字符串时作区分
4. 如果Symbol参数是一个对象，那么会调用对象`toString`方法，将其转为字符串
5. Symbol参数只是一个描述，参数相同，也不相等
6. Symbol不能跟其他类型的值进行y运算，会报错， `+-*/`等 和 字符串模板`${}`都不行。
7. Symbol可以显示的转为字符串
8. Symbol也能转为boolean值，但是不能转为数字！

## 作为属性名的Symbol
1. 因为Symbol是第一的，作为属性就不可能重名导致值被覆盖。
2. Symbol作为属性名时，只能在`[]`中访问和定义,不能通过 . 访问
3. Symbol类型可以定义一组常量，保证这组常量的值都是不相等的
4. Symbol作为属性时，该属性时公开属性，不是私有属性

## 实例： 消除魔术字符串
所谓魔术字符串指的是，在代码中多次出现、与代码形成强烈耦合的具体的某一个字符串。通过将其写成一个变量来消除魔术字符串。
```javascript
function getArea(shape, options) {
  let area = 0;

  switch (shape) {
    case 'Triangle': // 魔术字符串
      area = .5 * options.width * options.height;
      break;
    /* ... more code ... */
  }

  return area;
}
getArea('Triangle', { width: 100, height: 100 }); // 魔术字符串
```
```javascript
const shapeType = {
  triangle: 'Triangle'
};

function getArea(shape, options) {
  let area = 0;
  switch (shape) {
    case shapeType.triangle:
      area = .5 * options.width * options.height;
      break;
  }
  return area;
}

getArea(shapeType.triangle, { width: 100, height: 100 });
```
如果仔细分析，可以发现`shapeType.triangle`等于哪个值并不重要，只要确保不会跟其他`shapeType`属性的值冲突即可。因此，这里就很适合改用 `Symbol` 值。
```javascript
const shapeType = {
  triangle: Symbol()
};
```

## 属性名的遍历
1. Symbol作为属性名不会被各类方法或者迭代器遍历：
    - `for...in`
    - `for...of`
    - `Object.keys()`
    - `Object.getOwnPropertyNames()`
    - `JSON.parse()`
2. 但是Symbol是公开属性，有`Object.getOwnPropertySymbols()`方法，可以获取指定对象的Symbol属性组成的数组。
3. 新的API，`Reflect.ownKeys()`可以返回对象所有类型的键名，包括常规键名和Symbol键名
4. 由于Symbol作为名称和属性，不会被常规方法遍历到，我们可以用来定义一些非私有的、但有想用于内部的方法。

## `Symbol.for()` 和 `Symbol.keyFor()`