# 字符串的扩展

## 字符的unicode表示法
javascript允许采用`\uxxxx`形式表示一个字符, 其中`xxxx`表示字符的Unicode码点。
```javascript
"\u0061" //'a'
```

但是，这种表示法只限于码点在\u0000~\uFFFF之间的字符。超出这个范围的字符，必须用两个双字节的形式表示。
```javascript
'\uD842\uDFB7'//'𠮷'
```