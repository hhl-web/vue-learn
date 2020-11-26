/**
 * 先订阅 on
 * 后发布 emit
 * 那如果是先发布怎么办呢 ？
 */
// 
/**
 * _hasHookEvent不是表示是否存在钩子，它表示的是父组件有没有直接绑定钩子函数在当前组件上。源码须知
 * 比如这种形式的绑定
       * <child
    @hook:created="hookFromParent"> */
class Event {
    constructor() {
        this._events = Object.create(null);
        this.stackArr = []; //订阅数组,用来存放先发布后订阅的数据
    }
}
Event.prototype.$on = function(event, fn) {
    if (Array.isArray(event)) {
        for (let i = 0, l = event.length; i < l; i++) {
            this.$on(event[i], fn);
        }
    } else {
        (this._events[event] || this._events[event] = []).push(fn)
    }
    //将离线的数组执行
    for (let i = this.stackArr.length - 1; i > 0; i--) {
        let fn = this.stackArr[i];
        fn();
        this.stackArr.splice(i, 1);
    }
};

Event.prototype.$emit = function(event, ...args) {
    let fns = this._events[event];
    let ret = Array.from(fns);
    for (let i = 0; i < ret.length; i++) {
        ret[i].apply(ret[i], args);
    }
    //用一个新函数包裹自定义的emit函数
    let fn = () => {
        return this.emit.call(this, key, payload);
    }
    if ((!Object.keys(this._event).length) && (!this.stackArr)) {
        this.stackArr = [];
        this.stackArr.push(fn);
    }

};

Event.prototype.$off = function(event, fn) {
    //将所有的事件都清空
    if (!arguments.length) {
        this._events = Object.create(null);
        return;
    }
    //事件名传入数组，一个一个关闭事件
    if (Array.isArray(event)) {
        for (let i = 0; i < event.length; i++) {
            this.$off(event[i], fn)
        }
        return;
    }
    const cbs = vm._events[event];
    //找不到事件对于的cb，退出
    if (!cbs) {
        return;
    }
    //不传cb，当前的所有事件名都清空
    if (!fn) {
        this._events[event] = null;
        return;
    }
    //一一对于清空
    let cb;
    let i = cbs.length;
    while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
            cbs.splice(i, 1);
            break;
        }
    }
    return;
};
/**
 * 
 * @param {*} event 
 * @param {*} fn 
 * 先移除监听，再执行回调函数。这样就实现了只触发一次的功能
 */
Event.prototype.$once = function(event, fn) {
    function on() {
        this.$off(event, on);
        fn.apply(this, arguments)
    }.bind(this);
    on.fn = fn;
    this.$on(event, on);
};