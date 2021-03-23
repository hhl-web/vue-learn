/*
vnode  是虚拟节点
container 要渲染的容器
*/
export function render(vnode,container){
  //通过vnode创建真实的dom
  let ele =createDomElementFrom(vnode);
  container.appendChild(ele);
}
//通过vnode 创建真实的dom
/**如果没有type属性那么就是文本节点，直接转成文本节点
 * 如果有type属性，那么创建元素并且用变量属性建立vdom和真实dom的联系，方便后面用来更新真实dom元素
 */
function createDomElementFrom(vnode){
  let {type,key,props,children,text}=vnode;
  if(type){   //传递类型  标签
    //建立虚拟dom和真实dom的一个关系 后面可以用来更新真实dom
    vnode.dom=document.createElement(type);
    updateProperties(vnode);//根据当前的虚拟节点的属性，去更新真实的dom元素
    //children 也是虚拟节点 也要将children的虚拟节点转成真实dom放在type标签里，递归实现children虚拟节点转成真实dom
    children.forEach(childVnode=>{
      render(childVnode,vnode.dom)
    })
  }else{
    vnode.dom=document.createTextNode(text);
  }
  return vnode.dom;
}
//后续比对的时候，会根据老的属性和新的属性 更新节点  做属性的比对
function updateProperties(newVnode,oldProps={}){
  let dom=newVnode.dom;   //真实的dom
  let newProps=newVnode.props //当前虚拟节点的属性
  //如果老的里面有，新的里面没有，这个属性移除了
  for(let oldPropsName in oldProps){
    if(!newProps[oldPropsName]){
      delete dom[oldPropsName];
    }
  }
  //如果新有style 老的也有style ,但是样式不一样
  let newStyleObj=newProps.style||{};
  let oldStyleObj=oldProps.style||{};
  for(let propName in oldStyleObj){
    if(!(newStyleObj[propName])){
      dom.style[propName]='';
    }
  }
  //如果老的里面mei有，新的里面有
  for(let newPropsName in newProps){
    //style @click 
    if(newPropsName ==='style'){
      for(let s in newProps[newPropsName]){
        dom.style[s]=newProps[newPropsName][s];
      }
    }else{
      dom[newPropsName]=newProps[newPropsName];
    }
  }
}

export function patch(oldVnode,newVnode){
  //判断元素类型是否相同  类型不相同
  /**如果元素类型不同直接替换replaceChild，不过在转化之间也要把虚拟dom转成真实dom */
  if(oldVnode.type!==newVnode.type){
    return oldVnode.dom.parentNode.replaceChild(createDomElementFrom(newVnode),oldVnode.dom);
  }
  //类型相同 文本不相同
  /**如果时文本节点 比较文本内容  */
  if(oldVnode.text){
    if(oldVnode.text===newVnode.text) return;
    return oldVnode.dom.textContent=newVnode.text;
  }
  //类型一样 并且是标签 
  /**属性比较 儿子比较 */
  //1、需要根据新节点的属性更新老节点的属性
  //2、需要判断是否有儿子
    /*
    *  老的有儿子  新的有儿子
    *  老的有儿子 新的没儿子  复用老的真实dom直接操作真实dom删除儿子 
    *  老的没有 新的有   复用老的真实dom直接操作真实dom新增儿子
    */
  let domEle=newVnode.dom=oldVnode.dom; //获取真实dom,将旧的真实dom挂载到新的虚拟节点上，并没有创建真实的dom元素
  //比对新老节点的属性 更新属性
  updateProperties(newVnode,oldVnode.props);

  let oldChildren =oldVnode.children; //获取老儿子虚拟节点
  let newChildren =newVnode.children; //获取新儿子虚拟节点

  //老的有儿子  新的有儿子
  if(oldChildren.length>0 && newChildren.length>0){

    updateChildren(domEle,oldChildren,newChildren);

  }else if(oldChildren.length>0){ //删除儿子 老的有儿子 新的没儿子
    domEle[oldChildren]='';   //直接删除儿子
  }else if(newChildren.length>0){//新增了儿子 老的没有 新的有
    for(let i=0;i<newChildren.length;i++){
      //将儿子每个节点先转化成真实dom节点再新增
      domEle.appendChild(createDomElementFrom(newChildren[i]))
    }
  }
 //判断标签和key是否一样
  function isSameVode(oldV,newV){
    return oldV.key===newV.key && oldV.type ===newV.type
  }
  // a:0,b:1 映射表
  function keyMap(oldChildren){
    let map={};
    for(let i=0;i<oldChildren.length;i++){
      let current=oldChildren[i];
      if(current.key){
        map[current.key]=i;
      }
    }
    return map;
  }
  function updateChildren(parent,oldChildren,newChildren){
    let oldStartIndex=0;//获取老的第一个索引
    let oldStartVnode=oldChildren[0];//获取老的第一个值
    let oldEndIndex=oldChildren.length-1;//获取老的最后一个索引
    let oldEndVnode=oldChildren[oldEndIndex];//获取老的最后一个值
    let newStartIndex=0;//获取新的第一个索引
    let newStartVnode=newChildren[0];//获取新的第一个值
    let newEndIndex=newChildren.length-1;//获取新的最后一个索引
    let newEndVnode=newChildren[newEndIndex];//获取新的最后一个值

    let map=keyMap(oldChildren);
    //判断老的孩子和新的孩子 循环的时候谁先结束就停止循环

    while(oldStartIndex<=oldEndIndex && newStartIndex<=newEndIndex){
      if(!oldStartVnode){
        oldStartVnode=oldChildren[++oldStartIndex]
      }else if(!oldEndVnode){
        oldEndVnode=oldChildren[--oldEndIndex]
      }else
      //头比头  先比较头和头  在比较尾和尾
      if(isSameVode(oldStartVnode,newStartVnode)){
        patch(oldStartVnode,newStartVnode);   //还要进行比对，比对子节点下的属性和子节点下的孩子。
        oldStartVnode=oldChildren[++oldStartIndex];   //先自己加 再赋值++在前。
        newStartVnode=newChildren[++newStartIndex];
      }else if(isSameVode(oldEndVnode,newEndVnode)){
        patch(oldEndVnode,newEndVnode);   //还要进行比对，比对子节点下的属性和子节点下的孩子。
        oldEndVnode=oldChildren[--oldEndIndex];   
        newEndVnode=newChildren[--newEndIndex];
      }else if(isSameVode(oldStartVnode,newEndVnode)){
        patch(oldStartVnode,newEndVnode);
        parent.insertBefore(oldStartVnode.dom,oldEndVnode.dom.nextSiblings)
        oldStartVnode=oldChildren[++oldStartIndex];
        newEndVnode=newChildren[--newEndIndex];
      }else if(isSameVode(oldEndVnode,newStartVnode)){
        patch(oldEndVnode,newStartVnode);
        parent.insertBefore(oldEndVnode.dom,oldStartVnode.dom);
        oldEndVnode=oldChildren[--oldEndIndex];
        newStartVnode=newChildren[++newStartIndex];
      }else{
        //两个都不一样  暴力比对
        //需要先拿到新的节点 去老的中查找，如果不存在就创建插入即可
        let index=map[newStartVnode.key];
        if(index===null){
          //新的队列中没有此项
          parent.insertBefore(createDomElementFrom(newStartVnode),oldStartVnode.dom)
        }else{
          let toMoveNode=oldChildren[index];
          patch(toMoveNode,newStartVnode);
          parent.insertBefore(toMoveNode.dom,oldStartVnode.dom);
          oldChildren[index]=undefined;
        }
        newStartVnode=newChildren[++newStartIndex];
      }
    }
    //添加新的节点
    if(newStartIndex<=newEndIndex){
      for(let i=newStartIndex;i<newEndIndex;i++){
        let beforeEle=newChildren[newEndIndex+1]==null?null:newChildren[newEndIndex+1].dom;
        parent.insertBefore(createDomElementFrom(newChildren[i]),beforeEle)
        // parent.appendChild(createDomElementFrom(newChildren[i]));
      }
    }
    //删除剩余的节点
    if(oldStartIndex<=oldEndIndex){
      for(let i=oldStartIndex;i<oldEndIndex;i++){
        if(oldChildren[i]){
          parent.removeChild(oldChildren[i].dom);
        }
      }
    }
  }

}