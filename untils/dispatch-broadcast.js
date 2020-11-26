Vue.prototype.$dispatch = function(eventName, value) {
    let parent = this.$parent; // 先找第一层的$parent
    while (parent) {
        parent.$emit(eventName, value); // 触发方法
        parent = parent.$parent; // 接着向上找
    }
};
Vue.prototype.$broadcast = function(eventName, value) {
    let children = this.$children;

    function broad(children) {
        children.forEach((child) => {
            // 如果自己的儿子下面 还有儿子 继续查找
            child.$emit(eventName, value); // 触发当前儿子上的对应事件
            if (child.$children) {
                broad(child.$children);
            }
        });
    }
    broad(children); // 先找自己的儿子
};
/**
 *
 * @param {*} componentName 组件名
 * @param {*} eventName 事件名称
 * @param {*} params 数据
 */
function broadcast(componentName, eventName, params) {
    this.$children.forEach((child) => {
        let name = child.$options.componentName;
        if (name === componentName) {
            /*如果是我们需要广播到的子组件的时候调用$emit触发所需事件，在子组件中用$on监听*/
            child.$emit.apply(child, [eventName].concat(params));
        } else {
            /*非所需子组件则递归遍历深层次子组件*/
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}

function dispatch(componentName, eventName, params) {
    /*获取父组件，如果以及是根组件，则是$root*/
    let parent = this.$parent || this.$root;
    /*获取父节点的组件名*/
    let name = parent.$options.name;
    while (parent && (!name || name !== componentName)) {
        /*当父组件不是所需组件时继续向上寻找*/
        parent = parent.$parent;
        if (parent) {
            name = parent.$options.componentName;
        }
    }
    if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
    }
},