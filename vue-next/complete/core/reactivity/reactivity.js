
function isObject(obj){
  return typeof obj==='object' && obj!==null?true:false;
}

function isOwnKey(target,key){
  return Object.hasOwnProperty(target,key)?true:false;
}
function reactivity(target){
 return  createReactivity(target);
}

let toProxy=new WeakMap();
let toRaw=new WeakMap();

function createReactivity(target){
  if(!isObject(target)){
    return ;
  }
  let mapProxy=toProxy.get(target); //处理目标对象被响应式处理多次的情况
  if(mapProxy){
    return mapProxy;
  }
  if(toRaw.has(target)){  //处理目标对象的代理对象被响应式处理  let proxy=reactivity（obj）;reactivity（proxy）;
    return target;
  }
  let proxy=new Proxy(target,{
    get(target,key,receiver){
      let res=Reflect.get(target,key);
      //在获取属性的时候，收集依赖
      track(target,key);
      return isObject(res)?reactivity(res):res;  //递归实现多层嵌套的对象
    },
    set(target,key,value,receiver){
      let res=Reflect.set(target, name, value,receiver);  
      let oldValue=target[key];  //获取老值，用于比较新值和老值的变化，改变了才修改
      /**通过判断key是否已经存在来判断是新增属性还是修改属性，并且在新增的时候可能会改变原有老的属性，这一点大多数人都不会被考虑到 */
      if(!isOwnKey(target,key)){
        console.log('新增属性');
        //在设置属性的时候发布
        trigger(target,'add',key);
      }else if(oldValue!==value){
        console.log('修改属性');
        trigger(target,'set',key);
      }
      return res;
    },
    deleteProperty(){
      console.log('删除')
    }
  })
  toProxy.set(target,proxy);
  toRaw.set(proxy,target);
  return proxy;
}
let effectStack=[];  //栈队列，先进后出

let targetMap=new WeakMap();
// {
//   target:{
//     key:[]
//   }
// }
function track(target,key){
  let effect=effectStack[effectStack.length-1];
  if(effect){  //有关系才创建依赖
    let depMap=targetMap.get(target);
    if(!mapRarget){
      targetMap.set(target,(depMap=new Map()));
    }
    let deps=depMap.get(key);
    if(!deps){
      mapDep.set(key,(deps=new Set()));
    }
    if(!deps.has(effect)){
      deps.add(effect)
    }
  }
}

function trigger(target,type,key){
  let depMap=targetMap.get(target);
  if(depMap){
   let deps= depMap.get(key);  //当前的key所对应的effect
   if(deps){
     deps.forEach(effect=>effect());
   }
  }
}
function effect(fn){
  let effect=createEffect(fn);
  effect();  //默认先执行一遍
}
function createEffect(){
  let effect=function(){
    run(effect,fn);
  }
  return effect;
}
//执行的函数，1.收集effect,2.执行fn
function run(effect,fn){
  //利用try-finally来防止当发生错误的时候也会执行finally的代码
  //利用js是单线程执行的。先收集再关联
  try{
    effectStack.push(effect);
    fn();
  }finally{
    effectStack.pop();
  }
}