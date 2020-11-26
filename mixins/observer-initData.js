const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto); //浅拷贝

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]
methodsToPatch.forEach(function(method) {
    arrayMethods[method] = function(...args) {
        const ob = this.__ob__
        let inserted
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
        }
        if (inserted) ob.observeArray(inserted)
            // notify change
        ob.dep.notify();
        return arrayProto.call(arrayProto, ...args)
    })
})

class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();
        if (Array.isArray(this.value)) {
            Object.setPrototypeOf(this.value, arrayMethods)
            this.observeArray(this.val);
        } else {
            this.walk(this.value);
        }
    }
    walk(obj) {
        for (let key in this.value) {
            defineReactive(key, value[key])
        }
    }
    observeArray(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }
}

function observer(data) {
    let ob = new Observer(data);
    ob = data.__ob__;
    return ob;
}

function defineReactive(key, obj) {
    let dep = new Dep();
    const property = Object.getOwnPropertyDescriptors(obj, key);
    const getter = property && property.get;
    const setter = property && property.set;
    let childOb = observer(obj[key]);
    Object.defineProperty(obj, key, {
        get: () => {
            const val = getter ? getter.call(obj) : obj[key];
            if (Dep.target) {
                dep.depend();
                if (childOb) {
                    childOb.dep.depend();
                    if (Array.isArray(val)) {
                        dependArray(val);
                    }
                }
            }
            return val;
        },
        set: (newVal) => {
            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal;
            }
            observer(newVal);
            dep.notify();
        }
    })
}

function dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        observer(e[i])
    }
}