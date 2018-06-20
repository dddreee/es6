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

ES6 的模块不是对象，而是通过 `export` 命令显示指定输出的代码，再通过 `import` 命令输入。
```javascript
// ES6 模块
import {stat, exists, readFile} from 'fs'
```
这种加载称为"编译时加载"或者静态加载，即 ES6 可以在编译时完成模块加载，效率比 CommonJS 模块高，这也导致了没法引用 ES6 模块本身，因为它不是对象。

ES6 模块的好处：
- 不需要 UMD 模块格式，将来服务器和浏览器都会支持 ES6 模块格式。
- 浏览器的新 API 就能用模块格式提供，不再需要做成全局变量或者 navigator 对象的属性。
- 不再需要对象作为命名空间，可以通过模块提供。


## 2. 严格模式
ES6 的模块默认采用严格模式。严格模式主要有以下限制。

- 变量必须声明后再使用
- 函数的参数不能有同名属性，否则报错
- 不能使用 `with` 语句
- 不能对只读属性赋值
- 不能使用前缀 0 表示八进制数
- 不能删除不可删除的属性
- 不能删除变量 delete prop，会报错，是能删除属性 delete global[prop]
- eval 不会在它的外层作用于引入变量
- eval 和 arguments 不能被重新复制
- arguments 不会自动反映函数参数的变化
- 不能使用 arguments.callee
- 不能使用 arguments.caller
- 禁止 this 指向全局对象
- 不能使用 fn.caller 和 fn.arguments 获取函数调用的堆栈
- 增加了保留字(比如 protected , static , interface )

## 3 export 命令
模块的两个命令： export 和 import。 export 命令用域规定模块的对外接口

一个模块就是一个独立的文件，文件内部的所有变量，外部无法获取，如果希望外部能读取模块内部的某个变量，必须使用 export 关键字输出这个变量
```javascript
//profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1985;

//另外的写法
var firstName = '';
var lastName = '';
var year = 0;
export { firstName, lastName, year }
```
第二种写法与前一种写法等价的，但是优先使用这种写法。

export 命令处理输出变量，开可以输出函数或者类
```javascript
export function multiply(x, y){
    return x * y
}

function v1(){

}
function v2(){}
export {
    v1 as streamV1,
    v2 as streamV2,
    v2 as steamLatestVersion
}
```
通常情况下， export 输出的变量就是本来的名字， 但是可以用 as 关键字重命名。可以使用重命名将函数输出两次。

需要特别注意的是， export 命令规定的是对外的接口，必须与模块内部的变量建立一一对应的关系。
```javascript
export 1; //报错

var m = 1;
export m; //报错

//正确写法
export var m = 1;
export {m};
export {m as n}
```

同样 function 和 class 也必须遵守这样的写法
```javascript
function f(){}
export f; //报错

// 正确
export function f(){}
export {f}
```

另外， export 语句输出的接口， 与其对应的值是动态绑定关系，可以实时取到模块内部实时的值。 CommonJS 模块输出的是值的缓存，不存在动态更新。
```javascript
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500); //输出的值是 bar, 500ms 后变成 baz
```

export 命令可以出现在模块的任何位置，但必须处于顶层作用域。 import 命令也是。

## 4. import 命令
使用 export 命令定义了模块的对外接口以后，其他 js 文件就可以通过 import 命令加载这个模块
```javascript
import {firstName, lastName, year} from './profile.js'

// 可以使用 as 关键字，将变量重命名
import {lastName as surname} from './profile'
```

import 命令输入的变量都是只读的！！但是如果这个变量的值是对象，那么改写属性是允许的
```javascript
import {a} from './xxx.js'
a.foo = 'hello'
```

建议将输入的变量都当作完全制度，不要改变它的属性。

import 后面的 from 指定模块文件的位置，可以是相对路径和绝对路径。 .js 后缀可以省略。如果只是模块名,不带路径，那么必须有配置文件，告诉 js 引擎模块的位置
```javascript
import {myMethod} from 'util'
```
import 命令有提升效果，会提升到整个模块的头部，首先执行。

由于 import 命令是静态执行的，不能使用表达式和变量。

最后， import 语句会执行所加载的模块, 同一个 import 语句，只会执行一次。
```javascript
import 'lodash'

import 'lodash'
```
上面的代码仅仅执行 lodash 模块，不输入任何值

```javascript
import {foo} from 'my_module'
import {bar} from 'my_module'

// 等同于
import {foo, bar} from 'my_module'
```
上面代码中，虽然 foo 和 bar 在两个语句中加载，但是他们对应的而是同一个 my_module 模块，import 语句是 Singleton 模式 ????

目前阶段，通过 Babel 转发， CommonJS 模块的 require 命令和 ES6 模块的 import 命令， 可以写在同一个模块里面，但是最好不要这么做， 因为 import 命令在静态解析阶段执行，是最早执行的。下面的代码可能不会得到预期的结果
```javascript
require('core-js/modules/es6.symbol');
require('core-js/modules/es6.promise');
import React from 'React';
```

## 5. 模块的整体加载
