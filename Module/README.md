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
除了指定加载某个输出值，还可以使用星号 * 号，整体加载。
```javascript
// circle.js
export function area(radius){
    return Math.PI * radius * radius
}

export function circumference(radius){
    return 2 * Math.PI * radius
}

// 加载这个模块
import {area, circumference} from './circle'
console.log('圆面积: ' + area(4));
console.log('圆周长: ' + circumference(14))

// 整体加载
import * as circle from './circle'
console.log('圆面积: ' + circle.area(4))
console.log('圆周长: ' + circle.circumference(14))
```

注意，模块整体加载所在的那个对象（上例是 circle ），应该是可以静态分析的，所以不允许运行时改变。当作只读使用

## 6. export default 命令
使用 import 命令时，用户需要知道索要加载的变量名或者函数名。 为了给用户提供方便， 提供了 export default 命令，为模块指定默认输出。
```javascript
export default function(){
    console.log('foo')
}

import customName from './export-default'
customName();
```
加载该模块时， import 命令可以为该匿名函数指定任务的名字。

下面比较一下默认输出和正常输出
```javascript
// 第一组
export default function crc32(){}
import crc32 from 'crc32'

// 第二组
export function crc32 (){}
import {crc32} from 'crc32'
```
- export default 命令用于指定模块的默认输出
- 一个模块只有一个默认输出，export default 命令只能使用一次。因此 import 命令后面才不加大括号，只有唯一对应的 export default 命令。
- 本质上， export default 就是输出一个叫 default 的变量或者方法。
- export default 后面不能跟变量声明语句
- export default 后面可以直接写一个值

有了 export default 命令， 输入模块时就非常直观了。
```javascript
import _ from 'lodash'
```

## 7. export 与 import 的复合写法
如果在一个模块之中，先输入后输出同一个模块， import 语句可以与 export 写在一起
```javascript
export {foo, bar} from 'my_module';

// 可以理解为
import {foo, bar} from 'my_module';
export {foo, bar}
```
export 和 import 语句写成一行的时候， foo 和 bar 实际上并没有被导入到当前模块，相当于时对外转发了这两个接口，导致当前模块不能直接使用 foo 和 bar

模块的接口改名和整体输出
```javascript
export { foo as myFoo} from 'my_module';
export * from 'my_module'
```

默认接口的写法如下：
```javascript
export { default } from 'foo';
```

具名接口改为默认接口写法如下。
```javascript
export {es6 as default} from './someModule'
// 相当于
import { es6 } from './someModule'
export default es6
```

默认接口也可以改名为具名接口
```javascript
export {default as es6} from './someModule'
```

下面三种 import 语句， 没有对应的复合写法
```javascript
import * as someIdentifier from "someModule";
import someIdentifier from 'someModule';
import someIdentifier, {namedIdentifier} from "someModule";
```

为了做到形式的对称，现在[提案](https://github.com/leebyron/ecmascript-export-default-from)，补上上面的三种复合写法
```javascript
export * as someIdentifier from "someModule";
export someIdentifier from "someModule";
export someIdentifier, { namedIdentifier } from "someModule";
```

## 8. 模块的继承
模块之间也能继承。

假设又一个 circleplus 模块，继承了 circle 模块
```javascript
// circleplus.js
export * from 'circle';
export var e = 2.124123154123;
export default function(x) {
    return Math.exp(x)
}
```
上面的代码中的 export * , 表示再输出的 circle 模块的所有属性和方法， 注意， export * 会忽略 circle 模块的 default 方法。 然后上面的代码又输出自定义的变量 e 和默认方法。

这是也可以将 circle 的属性或方法，改名后再输出
```javascript
// circleplus.js
export {area as circleArea} from 'circle';
```

## 9. 跨模块常量
const 声明的常量只在当前代码块有效。如果想设置跨模块的常量，可以采用下面的写法
```javascript
// constants.js 模块
export const A = 1;
export const B = 3;
export const C = 4;

// test1.js
import * as constants from './constants'
console.log(constants.A); //1

// test2.js
import {A, B} from './constants';
console.log(A);
```
如果要使用的常量非常多，可以专门建一个 constants 目录，将各种常量卸载不同的文件里面,，然后将这些文件输出的常量， 合并再 index.js 里面，使用的时候直接加载 index.js 就好了

## 10. import()
### 简介
