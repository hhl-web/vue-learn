//vue内部是如何实现响应式数据变化的，响应式数据变化有什么特点
//实现响应式数据变化对象是通过其核心defineProperty()实现，数组是通过数组的方法进行重写。
// 特点： 使用对象的时候 必须先声明属性 ，这个属性才是响应式的
// 1.增加不存在的属性 不能更新视图 （vm.$set）
// 2。默认会递归增加 getter和setter
// 3.数组里套对象 对象是支持响应式变化的，如果是常量则没有效果
// 4.修改数组索引和长度 是不会导致视图更新的
// 5.如果新增的数据 vue中也会帮你监控（对象类型）

function observerArray(array) {
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i]
    observer(item)
  }
}
function observer(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    Object.setPrototypeOf(obj, proto)
    observerArray(obj)
  } else {
    for (let key in obj) {
      defineReactive(key, obj[key], obj)
    }
  }
}
function defineReactive(key, value, obj) {
  observer(value) //通过递归的方式观察对象的值是否也是对象，如果是对象，更改数据会发生视图层的变化
  Object.defineProperty(obj, key, {
    get: function () {
      return value
    },
    set: function (newValue) {
      if (newValue !== value) {
        value = newValue
        observer(newValue) //新值也要观测
        console.log('视图发生更新')
      }
    },
  })
}

//数据挟持
class Observe {
  constructor(obj) {
    console.log(obj)
    this.observe(obj)
    //数组方法进行重写
    let arrayProto = Array.prototype //先存一份原生的原型
    let proto = Object.create(Array.prototype) //复制一份一模一样原生的原型。
      [
        ('push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse')
      ].forEach((item) => {
        proto[item] = function (...ary) {
          let insert //数组新增的元素也要进行观察
          switch (item) {
            case 'push':
              insert = ary
            case 'unshift':
              insert = ary
            case 'splice':
              insert = ary.slice(2)
            default:
              break
          }
          observer(insert)
          console.log('视图更新');
          Object.defineProperty(proto,item,{
              value:insert,
          })
          
          return arrayProto[item].call(arrayProto, ...ary)
        }
      })
  }
  observerArray(array) {
    for (let i = 0, len = array.length; i < len; i++) {
      let item = array[i]
      this.observer(item);
    }
  }
  observer(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }
    if (Array.isArray(obj)) {
      Object.setPrototypeOf(obj, proto)     //对将来可能会操作数组的方法生成的元素进行劫持
      this.observerArray(obj)       //对已经定义过的数组元素进行劫持
    } else {
      for (let key in obj) {
        this.defineReactive(key, obj[key], obj)
      }
    }
  }
  defineReactive(obj, key, value) {
    Observe(value)
    let dep = new Dep()
    Object.defineProperty(obj, key, {
      get: () => {
        Dep.target && dep.addSubs(Dep.target)
        return value
      },
      set: (newValue) => {
        this.observe(newValue)
        if (value != newValue) value = newValue
        dep.notify()
      },
    })
  }
}
