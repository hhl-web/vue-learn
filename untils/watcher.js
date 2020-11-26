class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        this.oldval = this.get();
    }
    get() {
        Dep.target = this;
        let value = CompilerUtils.getValue(this.vm, this.expr);
        Dep.target = null;
        return value;
    }
    updater() {
        //更新操作  数据变化后 会调用观察者的update方法
        let newValue = CompilerUtils.getValue(this.vm, this.expr);
        if (newValue !== this.oldval) {
            this.cb(newValue);
        }
    }
}
//工具类
CompilerUtils = {
    //获取值
    getValue(vm, expr) {
        let value = expr.split(".").reduce((data, current) => {
            return data[current];
        }, vm.$data);
        return value;
    },
};