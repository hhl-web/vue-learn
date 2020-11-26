let computedLazy = true;
let _vm;

function initComputed(computed) {
    _vm.computedWatchers = Object.create(null);
    let _watcher = _vm.computedWatchers;
    for (const key in computed) {
        const userDef = computed[key];
        const getter = typeof userDef === "function" ? userDef : userDef.get;
        _watcher[key] = new Watcher(getter, computedLazy);
        handlerWtacher(key, _watcher);
    }
}

function handlerWtacher(key, target) {
    Object.defineProperty(target, key, {
        get: (key) => {
            const watcher = _vm.computedWatchers[key];
            if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate();
                }
                //正在渲染的watcher就是Dep.target
                //我思考了为什么不直接调用wtacher类的addDep呢？最终的目的不就是收集watcher。
                if (Dep.target) {
                    watcher.depend();
                }
                return watcher.value;
            }
        },
    });
}