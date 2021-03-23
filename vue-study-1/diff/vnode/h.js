/*
type 是元素类型，
props 节点的属性
children 是所有孩子
*/
import vnode from './vnode';
export default function createElement(type,props={},...children){
  //key不属于props里面的，父传子的时候也没有将key传入。
  //每个元素都生成一个key 用来diff算法的比对
  let key;
  if(props.key){
    key=props.key;
    delete props.key;
  }
  children=children.map(child=>{
    if(typeof child ==='string'){
      vnode(undefined,undefined,undefined,undefined,child);
    }else{
      return child;
    }
  })
  return vnode(type,key,props,children);
}
