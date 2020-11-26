let callback = [];
let pending = false;
let key = true;

function flushCallbacks() {
    pending = false;
    const copies = callback.slice(0);
    callback.length = 0;
    console.log(copies, "timeFunc执行了");
    for (let i = 0; i < copies.length; i++) {
        key = false;
        copies[i]();
    }
}

function cb() {
    console.log("cb");
    // setTimeout(() => {
    //     console.log("cb执行了");
    // }, 20);
}
let p = Promise.resolve();

function timeFunc() {
    p.then(flushCallbacks);
}

function tick(cb) {
    callback.push(() => {
        if (cb) {
            cb(cb);
        }
        console.log(key);
        if (!pending) {
            pending = true;
            timeFunc();
        }
    });
}
tick(cb);
//vue中什么时候执行这个callback
for (let i = 0; i < callback.length; i++) {
    callback[i]();
}