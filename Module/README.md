# Module 的语法
## 1. 概述
ES6 之前，模块加载方案主要是由社区定制的 CommonJS 和 AMD 两种，前者用于服务器，后者用于浏览器。

ES6 的模块设计思想是尽量静态化，在编译时就确定模块的依赖关系以及输入和输出的变量， CommonJS 和 AMD，都只能在运行时确定这些关系。

```javascript
// CommonJS 模块
let {stat, exists, readFile} = require('fs')
//等同于
let _fs = require('fs')
let stat = _fs.stat;
let exists = _fs.exists;
let readFile = _fs.readFile;

```
上面代码的实质是整体加载 `fs` 模块，生成一个运行对象（ `_fs` ）,然后从这个对象上获取3个方法。这种加载成为"运行时加载",只有运行时才能得到这个对象。

ES6 的模块不是对象，