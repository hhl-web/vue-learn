// https://www.cnblogs.com/guojiabing/p/10852362.html命名空间如如何使用
/**
 * 数据持久化
 * export default store => {
  if (localStorage.state) store.replaceState(JSON.parse(localStorage.state))
  store.subscribe((mutation, state) => {
    localStorage.state = JSON.stringify(state)
  })

  
}
 * 实现状态的统一管理，在项目当中实现共享状态。
 */
import Vue from 'vue';
let Vue;
let install={
    install(_Vue){
        Vue=_Vue;
        Vue.mixin({
            beforeCreate(){     //将this.$store挂载到每个组件上
              if(this.$options&&this.$options.store){
                  //给根实例增加$store属性
                  this.$store=this.$options.store;
              }else{
                  //给每个子组件添加$store属性，有可能单独创建了一个实例没有父亲，那就无法取到store属性
                  this.$store=this.$parent && this.$parent.$store
              }
            }
        })
    }
}


//工具函数：函数循环对象的key且拿到对象的每个key所对应的值。
function forEach(obj,cb){
    Object.keys(obj).forEach((key)=>{
        cb(key,obj[key]);
    })
}

/**
 * 格式化数据
 * 
 * {
    _rawModule:rootModule, //模块本身
    _children:{}, //模块的子级
    state:rootModule.state //模块自身的状态
    }
 */

class ModulesCollection{
  constructor(options){
      this.register([],options)
  };
  register(path,rootModule){
        //如果是根节点
      if(path.length===0){
          this.root=module;
      }else{
        // 处理根节点的_children的属性，用reduce实现递归，返回parent是一个对象
          let parent=path.slice(0,-1).reduce((root,current)=>{
              return root._children[current];
          },this.root)
          parent._children[path[path.length-1]]=module;
      }
      // 如果模块有module属性则递归实现格式化
      if(rootModule.module){
          forEach(rootModule.module,(moduleName,module)=>{
              this.register(path.concat(moduleName),module);
          })
      }
  }
}


//将每个模块的actions,mutations,state,挂载到store上。
const installModule =(store,rootState,path,rootModule)=>{
  if(path.length>0){
      let parent=path.slice(0,-1).reduce((root,current)=>{
          return root[current];
      },rootState)
      Vue.set(parent,path[path.length-1],rootState.state);
  }
  //获取根节点的getters
  let getters=rootModule._rawModule.getters;
  if(getters){
      forEach(getters,(gettersName,fn)=>{
          Object.defineProperty(getters,gettersName,{
              get(){
                  return fn(rootModule.state)
              }
          })
      })
  };
  //获取根节点的mutations
  let mutations=rootModule._rawModule.mutations;
  if(mutations){
      forEach(mutations,(mutationsName,fn)=>{
          let mutations=store.mutations[mutationsName] || [];   // mutations是数组
          mutations.push((payload)=>{
              fn(rootModule.state,payload);
              // 发布 让所有的订阅依次执行。
              store.subscribe.forEach(fn=>{
                  fn({type:mutationsName,payload},rootState)  //{type:mutationsName,payload} =>store
              })
          })
          //store.mutations[mutationsName]就是个数组了
          store.mutations[mutationsName]=mutations;
      })
  };
  let actions=rootModule._rawModule.actions;
  if(actions){
      forEach(actions,(actionsName,fn)=>{
        //收集相同变量名的actions，等待发布的时候一起触发
          let actions=store.actions[actionsName] || [];   
          actions.push((payload)=>{
              fn(store,payload);
          });
          store.actions[actionsName]=actions;

      })
  };
  if(rootModule._children){
      forEach(rootModule._children,(moduleName,module)=>{
        installModule(store,rootState,path.concat(moduleName),module);
      })
  }
}


class Store{
    constructor(options){
    //vuex定义了响应式数据变化，数据更新则视图更新。其实响应式也是一个模块需要去学习的。
        this.s=new Vue({    
            data(){
                return {state:options.state}
            }
        });
        this.getters={};    
        this.mutations={};
        this.actions={};
        this._subscribes=[];	//订阅容器
        //格式化options
        this._modules=new ModulesCollection(options);
        installModule(this,this.state,[],this._modules.root);
        // store身上有subscribe方法,暴露在外面给用户使用
        subscribe(fn){
            this._subscribes.push(fn);    //什么时候_subscribes这个数组被调用了。就是在commit的时候
        }
        commit=(mutationsName,payload)=>{
            this.mutations[mutationsName].forEach(fn=>{
                fn(payload);
            })
        };
        dispatch =(actionsName,payload)=>{
           this.actions[actionsName].forEach(fn=>{
               fn(payload);
           })
            //源码里面有个变量，来控制是否通过mutaion来更新状态。
        }
        get state(){    //类的属性访问器
            return this.s.state
        }
    }
}




