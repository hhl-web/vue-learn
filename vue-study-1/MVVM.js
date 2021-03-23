class Dep{
  constructor(){
    this.subs=[];   //存放watcher

  }
  //订阅
  addSubs(watcher){
    this.subs.push(watcher)
  }
  //发布
  notify(){
    this.subs.forEach(watcher=>{
      watcher.updater();
    })
  }
}
class Watcher{
  constructor(vm,expr,cb){
    this.vm=vm;
    this.expr=expr;
    this.cb=cb;
    this.oldval=this.get()
  }
  get(){
    Dep.target=this;
    let value=CompilerUtils.getValue(this.vm,this.expr);
    Dep.target=null;
    return value;
  }
  updater(){    //更新操作  数据变化后 会调用观察者的update方法
    let newValue=CompilerUtils.getValue(this.vm,this.expr);
    if(newValue!==this.oldval){
      this.cb(newValue);
    }
  }
}
//数据挟持
class Observe{
  constructor(data){
    console.log(data);
    this.observe(data)
  }
  observe(data){
    if(data && typeof data==='object'){
      for(let key in data){
        this.defineReactive(data,key,data[key]);
      }
    }
  }
  defineReactive(obj,key,value){
    Observe(value);
    let dep=new Dep()
    Object.defineProperty(obj,key,{
      get:()=>{
        Dep.target && dep.addSubs(Dep.target);
        return value;
      },
      set:(newValue)=>{
        this.observe(newValue);
        if(value!=newValue) value=newValue; dep.notify();
      }
    })
  }
}
class Compiler{
  constructor(el,vm){
    this.vm=vm;
    this.el=this.isElementNode(el)?el:document.querySelector(el);
    //把当前节点中的元素获取到放到内存中

    let fragment=this.node2fragment(this.el)
    //把节点中的内容进行替换

    //编译模板  用数据编译
    this.compile(fragment)
    //把这个内容在塞到页面中
    this.$el.appendChild(fragment);
  }
  isDirective(attrName){
    return attrName.startWith('v-');
  }
  compileElement(node){
    let attr=node.attributes;//类数组
    [...attr].forEach(atr=>{
      let {name,value:expr}=atr;
      if(this.isDirective(name)){
        console.log(node) //指令元素
        let[,directive]= name.split('-');
        let [directiveName,eventName]=directive.split('.');   //处理v-on:click指令
        CompilerUtils[directiveName](node,expr,)
        CompilerUtils[directive](node,expr,this.vm,eventName)
      }
    })
  }
  compileText(node){
    let content=node.textcontent;   //节点的文本
    if(/\{\{(.+?)\}\}/.test(content)){
      console.log(content)//找到所有文本
      CompilerUtils['text'](node,content,this.vm)
    }
  }
  //用来编译内存中的dom节点
  compile(node){
    let childNodes=node.childNodes;  //dom的第一层
    [...childNodes].forEach(child=>{
      if(this.isElementNode(child)){
        console.log('element');
        this.compileElement(child);
        //如果是元素的话，需要遍历子节点
        this.compile(child);
      }else{
        console.log('text');
        this.compileText(child)
      }
    })
  }
  node2fragment(node){
    //把所有的节点都拿到,创建一个文档碎片。
    let fragment=document.createDocumentFragment();
    let firstChild;
    while(firstChild=node.firstChild){
      fragment.appendChild(firstChild);
    }
    return fragment;  
  }
  isElementNode(node){
    return node.nodeType===1
  }
}
//处理不同指令不同的功能调用不同的处理方式
CompilerUtils={
  //获取值
  getValue(vm,expr){
    let value=expr.split('.').reduce((data,current)=>{
      return data[current];
    },vm.$data)
    return value;
  },
  //设置值
  setValue(vm,expr,value){
    return expr.split('.').reduce((data,current,index,arr)=>{
      if(index===arr.length-1){
        return data[current]=value;
      }
      return data[current];
    },vm.$data)
  },
  model(node,expr,vm){
    let fn=this.updater['modelUpdater'];
    new Watcher(vm,expr,(newValue)=>{   //指令v-model:在收集key为expr的watcher实例依赖
      fn(node,newValue);
    })
    let value=this.getValue(vm,expr);
    node.addEventListener('input',(e)=>{
      let value=e.target.value;
      this.setValue(vm,expr,value);
    })
    fn(node,value);
  },
  on(node,expr,vm,eventName){
    node.addEventListener(eventName,(e)=>{
      return vm[expr].call(vm,e);
    })
  },
  html(){

  },
  getContentValue(vm,expr){
    return expr.replace(/\{\{(.+?)\}\}/g,(...agrs)=>{
      return this.getValue(vm,args[1]);
    })
  },
  text(node,expr,vm){ //expr {{a}} {{b}} {{c}}
    let content=expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
      new Watcher(vm,args[1],()=>{
        let value=this.getContentValue(vm,expr);    //返回了一个全的字符串
        fn(node,value)
      })
      return this.getValue(vm,args[1]);
    })
    let fn=this.updater['textUpdater'];
    fn(node,content);
  },
  updater:{
    modelUpdater(node,value){
      node.value=value;
    },
    htmlUpdater(node,value){
      node.innerHTML=value;
    },
    textUpdater(node,value){
      node.textContent=value; //将值放在节点的文本内容上
    }
  }
}
class Vue{
  constructor(option){
    
    //this.$el $data $options
    this.$el=option.el;
    this.$data=option.data;
    this.computed=option.computed;
    this.methods=option.methods;
    //如果存在根元素 就编译模板
    if(this.$el){
      //把数据 全部转化成用 Object.defineProperty来定义
      new Observe(this.$data);

      for(let key in this.computed){  //根据依赖的数据添加watcher
        Object.defineProperty(this.$data,key,{
          get:()=>{
            return this.computed[key]();
          },
          set:(newVal)=>{
            
          }
        })
      }
      //将methods对象代理到vm头上
      for(let key in this.methods){
        Object.defineProperty(this,key,{
          get:()=>{
            return this.methods[key];
          }
        })
      }
      //数据获取操作 vm上的取值操作
       //都代理到 vm.$data
      this.getVmProxy()
      new Compiler(this.$el,this);
      // for(let key in )
    }

  }
  getVmProxy(){
    for(let key in this.$data){
      Object.defineProperty(this,key,{ //实现可以通过vm取到对应的内容
        get:()=>{
          return this.$data[key];
        },
        set:(value)=>{
          this.$data[key]=value;
        }
      })
    }
  }
}
