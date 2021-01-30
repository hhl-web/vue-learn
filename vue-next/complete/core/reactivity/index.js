let currentEffect;
//1.收集依赖，2.触发依赖
class Dep{
  constructor(){
    //收集依赖的容器
    this.effects=new Set();
  }
  depend(){
    if(currentEffect){
      this.effects.add(currentEffect);
    }
  }
  notice(){
    for(const effect of this.effects){
      effect();
    }
  }
}

export const watchEffect=(effect)=>{
  currentEffect=effect;
  effect();
  currentEffect=null;
}

const targetMap=new WeakMap();
export function reactive(raw){
  const getDep=(target,key)=>{
    let depsMap=targetMap.get(target);
    if(!depsMap){
      depsMap=new Map();
      targetMap.set(target,depsMap)
    }

    let dep=depsMap.get(key);
    if(!dep){
      dep=new Dep();
      depsMap.set(key,dep);
    }
    return dep;
  }
  return new Proxy(raw,{
    get(target,key){
      const dep=getDep(target,key);
      dep.depend();
      return Reflect.get(target,key);
    },
    set(target,key,val){
      const dep=getDep(target,key);
      const result=Reflect.set(target,key,val);
      dep.notice();
      return result;
    }
  })
}