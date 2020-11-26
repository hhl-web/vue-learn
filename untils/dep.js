class Dep {
    constructor() {
            this.subs = []; //存放watcher
        }
        //订阅
    addSubs(watcher) {
            this.subs.push(watcher);
        }
        //发布A
    notify() {
        this.subs.forEach((watcher) => {
            watcher.updater();
        });
    }
}