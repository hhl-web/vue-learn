import {watchEffect} from './reactivity/index.js';


export function createApp(rootComponent){
  const app={
    mount(rootContainer){
      const setupResult = rootComponent.setup();
      let isMounted=false;
      let prevSubTree;
      watchEffect(()=>{
        if(!isMounted){
          isMounted=true;
          const subTree=rootComponent.render(setupResult);
          prevSubTree=subTree;
          mountElement(subTree,rootContainer)
        }else{
          const subTree=rootComponent.render(setupResult);
          diff(prevSubTree,subTree);
          prevSubTree=subTree;
        }
      })
    }
  }
  return app;
}