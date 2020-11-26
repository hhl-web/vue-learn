const _toString = Object.prototype.toString;

/*实现Array.from转换成真的数组的过程
    Array.from() 方法从一个类似数组或可迭代对象创建一个新的，浅拷贝的数组实例。
*/

export function toArray(list: any, start ? : number): Array < any > {
        start = start || 0;
        let i = list.length - start;
        const ret: Array < any > = new Array(i);
        while (i--) {
            ret[i] = list[i + start];
        }
        return ret;
    }
    /**
     * 判断是否是对象
     * @param {*} obj
     */
export function isPlainObject(obj: any): boolean {
    return _toString.call(obj) === "[object Object]";
}