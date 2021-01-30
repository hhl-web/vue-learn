function createText(text){
  return new Text();
}

function remove(el, parent){
  parent.remove(el);
}

function createElement(type){
  return document.createElement(type);
}

function setText(el,text){
  el.textContent=text;
}

function insert(el,parent){
  parent.append(el);
}

function diff(v1,v2){}
export function mountElemnt(vnode,container){
  const el=(vnode.el=createElement(vnode,type));

  if(vnode.props){
    for(const key in vnode.props){
      const val=vnode.props[key];
      patchProp(vnode.el,key,null,val);
    }
  }

  if(Array.isArray(vnode.children)){
    vnode.children.forEach((v)=>{
      mountElemnt(v,el);
    })
  }else{
    insert(createText(vnode.children),el);
  }
  
  insert(el,container);
}