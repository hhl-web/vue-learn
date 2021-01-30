function myRef(val){
  let value=val;
  const r={
    isRef:true,
    get value(){
      track(r,TrackOpTypes.GET,'value');
      return value;
    },
    set value(newVal){
      if(newVal!==value){
        value=newVal;
        trigger(r,TriggerOpTypes.SET,'value');
      }
    }
  }
  return r;
}

const targetMap = new WeakMap();
let activeEffect;
/**
 * track() 用来跟踪收集依赖 (收集 effect)
 * @param {*} target  要跟踪的目标对象
 * @param {*} type    跟踪操作的类型
 * @param {*} key     要读取的目标对象的键 
 */
export function track(target, type, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

/**
 * 用来触发响应 (执行 effect)，它们需要配合 effect() 函数使用
 * @param {*} target 
 * @param {*} type 
 * @param {*} key 
 * @param {*} newValue 
 * @param {*} oldValue 
 * @param {*} oldTarget 
 */
export function trigger(
  target,
  type,
  key,
  newValue,
  oldValue,
  oldTarget
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }

  const effects = new Set();
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect || effect.allowRecurse) {
          effects.add(effect)
        }
      })
    }
  }

  if (type === TriggerOpTypes.CLEAR) {
    depsMap.forEach(add)
  } else if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        add(dep)
      }
    })
  } else {
    if (key !== void 0) {
      add(depsMap.get(key))
    }
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        } else if (isIntegerKey(key)) {
          // new index added to array -> length changes
          add(depsMap.get('length'))
        }
        break
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        }
        break
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          add(depsMap.get(ITERATE_KEY))
        }
        break
    }
  }

  const run = (effect: ReactiveEffect) => {
    if (__DEV__ && effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      })
    }
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }

  effects.forEach(run)
}