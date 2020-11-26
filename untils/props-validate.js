/**
 * vue中如何实现props类型的的校验 eg:
 * data:{type:Boolean,....}
 */

function getTypeIndex(type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
        return isSameType(expectedTypes, type) ? 0 : -1;
    }
    for (let i = 0, len = expectedTypes.length; i < len; i++) {
        if (isSameType(expectedTypes[i], type)) {
            return i;
        }
    }
    return -1;
}

function isSameType(a, b) {
    return getType(a) === getType(b);
}
/**
 *
 * @param {*} fn
 * Function.toString();"function Function() { [native code] }";
 * let obj={a:1};obj.toString();"[object Object]";
 * match是一个数组;["function Function","Function",...]
 */
function getType(fn) {
    const match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : "";
}