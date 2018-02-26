# 字符串的扩展

## 字符的unicode表示法
javascript允许采用`\uxxxx`形式表示一个字符, 其中`xxxx`表示字符的Unicode码点。
```javascript
"\u0061" //'a'
```

但是，这种表示法只限于码点在\u0000~\uFFFF之间的字符。超出这个范围的字符，必须用两个双字节的形式表示。
```javascript
'\uD842\uDFB7'//'𠮷'

'\u20BB7' // ' 7'
```
上面的代码表示，如果直接再`\u`后面跟上超过`0xFFFF`的值，JavaScript会理解成`\u20BB + 7`。由于`\u20BB`是一个不可打印的字符，所以只会显示一个空格。

ES6对这种情况做了改进，只要将码点放入大括号，就能正确解读这个字符。
```javascript
"\u{20BB7}"; //𠮷

"\u{41}\u{42}\u{43}"; //ABC

let hello = 123;
hell\u{6F}; //123
```
有了这种表示方法之后，JavaScript有6种方式表示字符：
```javascript
'\z' === 'z';   //true
'\172' === 'z'  // true
'\x7A' === 'z'  // true
'\u007A' === 'z' // true
'\u{7A}' === 'z' // true
```
***
### codePointAt()
JavaScript内部，字符以UTF-16的格式存储，每个字符固定2个字节。Unicode码点大于`0xFFFF`的字符，JavaScript会认为是两个字符。
```javascript
let s = '𠮷';

s.length; //2
s.charAt(0); // ''
s.charAt(1); // ''
s.charCodeAt(0); //55362
s.charCodeAt(1); //57271
```
汉子`𠮷`的码点是`0x20BB7`，UTF-16编码是`0xD842 0xDFB7`（十进制是`55362 57271`）。对于这种4个字节的字符，JavaScript无法正确处理，`charAt`方法无法读取整个字符，而`charCodeAt`方法只能返回前两个字节和后两个字节的值。

ES6则提供了`codePoitAt`方法来正确处理这种4个字节的字符。
```javascript
let s = '𠮷';

s.codePointAt(0);//134071
```
`codePointAt`返回了十进制的码点（16进制的`0x20BB7`）。其他在`UTF-16`的范围内的字符，`codePointAt`和`charCodeAt`方法返回的值相同。

总之，`codePointAt`会返回32位的UTF-16字符的码点，返回的是十进制的值。寻常for循环在遍历字符串的时候同样会出问题，用`for...of`替代就能正确的遍历了

`codePointAt`方法是测试一个字符由两字节还是四字节构成：
```javascript
function is32Bit(s){
    return s.codePointAt(0) > 0xFFFF;
}
```

***
### String.fromCodePoint()

ES5提供`fromCodeAt`方法，用于从码点返回字符，但是这个方法不能识别32位的UTF-16字符（Unicode编号大于0xFFFF）。

ES6提供的`fromCodePoint`方法则可以识别`fromCodeAt`识别不了的字符。`fromCodePoint`这个方法作用于String上，`codePointAt`方法作用于字符串实例上。
***
### 字符串的遍历接口

ES6为字符串添加了遍历器接口，使字符串能被`for...of`遍历。
```javascript
for(let codePoint of 'foo'){
    console.log(codePoint);
}
```

`for...of`最大的好处是能正确识别码点大于`0xFFFF`的字符。
***
### at()
ES5的`charAt`方法，返回字符串给定位置的字符，同样无法正确返回`0xFFFF`范围之外的字符，因此ES6提供了`at`方法，来弥补`charAt`方法的不足。

```javascript
'abc'.charAt(0); //a
'𠮷'.charAt(0); // '\uD842'

'abc'.at(0); //a
'𠮷'.at(0); //𠮷
```
***
### normalize()
有些字符是合成字符，JavaScript无法正确识别，因此ES6提供`normalize`方法用来将字符的不同表示方法统一为同样的形式，这称为 Unicode 正规化。
```javascript
'\u01D1'==='\u004F\u030C' //false

'\u01D1'.length // 1
'\u004F\u030C'.length // 2

'\u01D1'.normalize() === '\u004F\u030C'.normalize(); //true
```
***
 ### includes(), startsWith(), endsWith()
 ES5只提供了`indexOf`方法判断是否包含字符串，ES6又提供了3中方法。顾名思义，`incluedes`是否包含，`startsWith`是否以某个字符串开始， `endsWith`是否以某个字符串结束。
 ```javascript
let s = 'Hello World!';

s.includes('Hello'); //true
s.startsWith('Hel'); //true
s.endsWith('d!'); //true
 ```

 这三个方法都支持第二个参数，表示开始搜索的位置。
 ```javascript
let s = 'Hello World!';
s.includes('World', 6); //true
s.startsWith('Hell', 5); //false
 ```

 ***
 ### repeat()
 `repeat`方法返回一个新字符串，表示原字符串重复n次
 ```javascript
'x'.repeat(3); //'xxx'
'abc'.repeat(0); //''
 ```
 如果传入的小数，则会取整
 ```javascript
'x'.repeat(2.3); //xx
 ```

 如果传入的是`Infinity`或者负数，则会报错。
 ```javascript
'n'.repeat(Infinity);
'n'.repeat(-1); //都会报错
 ```

 但是如果是0到-1之间的负数小数和-0都会变成0，能正常运行。NaN也被看成是0，传入的字符串会先转换成数字，在运行。

 ***
 ### padStart(), padEnd()
ES2017引入了字符串长度补齐功能，`padStart`用于头部补齐，`padEnd`用于尾部补齐。`padStart`和`padEnd`接受两个参数，第一个指定字符串的最小长度， 第二个参数用来补齐d额字符串。如果用来补齐的字符串与原字符串长度之和超过了最小长度，则会截去超出的补全字符串。
```javascript
'x'.padStart(5, 'ab'); //ababx

'x'.padStart(2, 'ab'); //ax
```

如果省略第二个参数，则用空格替代。
```javascript
'x'.padStart(3); //'  x'
```

`padStart`的常见用途是为数值补全指定位数。下面代码生成 10 位的数值字符串。
```javascript
'1'.padStart(10, '0'); // "0000000001"
'12'.padStart(10, '0'); // "0000000012"
'123456'.padStart(10, '0'); // "0000123456"
```
***
### matchAll()

`matchAll`方法返回一个正则表达式在当前字符串的所有匹配，详见《正则的扩展》的一章。

***
### 模板字符串
传统的JavaScript,输出模板通常写成：
```javascript
let basket = {
    count: '',
    onSale: ''
}
$('#result').append(
  'There are <b>' + basket.count + '</b> ' +
  'items in your basket, ' +
  '<em>' + basket.onSale +
  '</em> are on sale!'
);
```

上面这种写法特别麻烦，ES6增加了模板字符串解决了这个问题。

```javascript
$('#result').append(`
    There are <b> ${basket.count} </b>
    items in your basket,
    <em> ${basket.onSale}
    </em> are on sale!
`);
```

模板字符串（template string）是增强版的字符串，用反引号（`）标识。它可以当作普通字符串使用，也可以用来定义多行字符串，或者在字符串中嵌入变量。
