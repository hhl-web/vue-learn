let _data = {
    key: {
        abc: "abc",
        fdg: function() {
            return 12;
        },
    },
};
//代理拦截
function proxy(target, sourceKey, key) {
    Object.defineProperty(target, key, {
        get: () => {
            return target[sourceKey][key];
        },
        set: (newValue) => {
            target[sourceKey][key] = newValue;
        },
    });
}

proxy(_data, "key", "abc");
console.log(_data.abc); //abc
//使用es6的Proxy实现代理，那么target对象的所有属性都会被代理，可以使用在日志记录操作之类的场景。代理对象和目标对象是浅拷贝
let p = new Proxy(_data, {
    get: (target, key) => {
        console.log("target:", target, "key:", key);
    },
});
console.log(p);