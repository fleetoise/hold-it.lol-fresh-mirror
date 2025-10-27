import browser from 'webextension-polyfill';

export async function getOptions() {
  return (await browser.storage.local.get('options')).options || {};
}


export function kindaRandomChoice(array, seed = null) {
    if (seed === null) seed = Math.random();
    const x = Math.sin(seed++) * 10000;
    const random = x - Math.floor(x);
    const i = Math.floor(random * array.length);
    return array[i];
}


export function compareShallow(a, b, keys) {
    for (const key of keys) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}


export function verifyStructure(obj, structure) {
    if (!obj) obj = {};
    for (let key in structure) {
        let type = obj[key]?.constructor;
        const structureType = structure[key]?.constructor;

        if (!(key in obj) || (type !== structureType)) {
            obj[key] = structure[key];
        }

        type = obj[key]?.constructor;

        if (type === Object) {
            verifyStructure(obj[key], structure[key]);
        }
    }
    return obj;
}
