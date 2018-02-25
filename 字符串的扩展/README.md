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

### codePointAt()
JavaScript内部，字符以UTF-16的格式存储，每个字符固定2个字节。Unicode码点大于`0xFFFF`的字符，JavaScript会认为是两个字符。
```javascript
let s = '𠮷';

s.length; //2
s.charAt(0); // ''
s.charAt(1); // ''

```