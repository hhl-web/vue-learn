//实现虚拟dom 主要就是一个对象 来描述dom节点  createElement h 核心都是创建dom
//h方法就是通过dom的属性，类型，孩子产生一个vnode。
import {h,patch} from './vnode/index.js';


//常见的dom操作做优化
//1.前后追加
//2.正序和倒序


let vnode=h('div', { id: 'wrapper', a: 1 }, h('span', { style: { color: 'red' } }, 'hello'), 'word');


//render 将虚拟节点转化成真实的dom，再插入app中

render(vnode,'app');

let newVnode=h('div',{},'hello word')
setTimeout(()=>{  
  //比对新老节点
  patch(vnode,newVnode)
},2000)



{/* <div id="wrapper" a="1">
<span style="{color:red}">hello</span>
word
</div> */}

// {
//   type: 'div',
//   props:{ id:'wrapper', a:1},
//   children: [{
//     type: 'span',
//     props: {
//       style:{
//         color: 'red',
//       }
//     },
//     children: [{
//       type:'',
//       props:'',
//       children:[],
//       text:'hello',
//     }]
//   },
//   {
//     type: '',
//     props: '',
//     children: [],
//     text: 'zf',
//   }]
// }