//创建vnode节点
/**
 * 虚拟dom节点有如下的属性
 * @param {*} type 
 * @param {*} key 
 * @param {*} props 
 * @param {*} children 
 * @param {*} text 
 */
function vnode(type,key,props,children,text){
  return {
    type,
    key,
    props,
    children,
    text
  }
}
export default vnode;
//因为如果直接操作dom，dom自身会带很多的属性，遍历查找的条件很多。所有通过虚拟节点来描述真实dom节点，操作虚拟节点来提高其性能。