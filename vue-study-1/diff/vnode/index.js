import h from './h.js';
import {render,patch} from './patch.js';
export{
  h,
  render,
  patch
};


// function Bibao(){
//   var a=1;
//   this.addA=function(){
//     a;
//   };
//   this.getA=function(){
//     return a;
//   }
// }

// var b=new Bibao();
// var num=b.getA();
//通过new关键字创建一个b实例,并且b实例身上有getA方法,调用它来获取a的值。当使用new关键字来执行Bibao函数时，其实在这个过程当中，会有一个执行上下文推入栈并且会创建一个词法环境，而这个词法环境包含着标识符的映射关系，其有a：1，addA:function,getA:function,我通过Bibao构造函数内部创建了addA和getA,这两个函数一旦被创建了，都会保持词法环境的引用,通过内值属性[[Enviroment]]属性。所有在Bibao构造函数外部访问getA函数，实际上就是创建了包含a变量的闭包。