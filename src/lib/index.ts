import { getAddress } from '@ethersproject/address';
import { BigNumber, ethers } from 'ethers';

import config from '@src/config';
// import { FEATURE_NAMES } from '@src/web3/config';

import colors from './colors';
import constants from './constants';
import * as conversion from './conversion';
import fontSize from './fontSize';
import layout from './layout';
import parse from './parse';

// 6287103
// VERIFICATION
export const isAnybodyThere = (value: any) => {
    try {
        if (!isUndefinedOrNull(value)) return true;
        return false;
    } catch {
        return false;
    }
};
export const isUndefined = (value: any) => {
    return typeof value === 'undefined';
};

export const isUndefinedOrNull = (value: any) => {
    return isUndefined(value) || value === null;
};
export const isUndefinedOrNullOrNotArray = (value: any) => {
    return isUndefinedOrNull(value) || !Array.isArray(value);
};
export const isUndefinedOrNullOrArrayEmpty = (value: any) => {
    return isUndefinedOrNullOrNotArray(value) || value.length === 0;
};
export const isUndefinedOrNullOrNotObject = (value: any) => {
    return isUndefinedOrNull(value) || typeof value !== 'object';
};
export const isUndefinedOrNullOrObjectEmpty = (value: any) => {
    return isUndefinedOrNullOrNotObject(value) || Object.getOwnPropertyNames(value).length === 0;
};
export const isUndefinedOrNullOrNotString = (value: any) => {
    return isUndefinedOrNull(value) || typeof value !== 'string';
};
export const isUndefinedOrNullOrStringEmpty = (value: any) => {
    return isUndefinedOrNullOrNotString(value) || value === '';
};
export const isUndefinedOrNullOrStringEmptyOrZeroOrStringZero = (value: any) => {
    return isUndefinedOrNullOrNotString(value) || value === '' || value === 0 || value === '0';
};
export const isUndefinedOrNullOrNotBoolean = (value: any) => {
    return isUndefinedOrNull(value) || typeof value !== 'boolean';
};
export const isUndefinedOrNullOrBooleanFalse = (value: any) => {
    return isUndefinedOrNullOrNotBoolean(value) || value === false;
};
export const isUndefinedOrNullOrNotFunction = (value: any) => {
    return isUndefinedOrNull(value) || typeof value !== 'function';
};
export const isUndefinedOrNullOrNotNumber = (value: any) => {
    return isUndefinedOrNull(value) || typeof value !== 'number' || isNaN(value);
};
export const isUndefinedOrNullOrNumberZero = (value: any) => {
    return isUndefinedOrNullOrNotNumber(value) || value === 0;
};
export const isUndefinedOrNullOrNotBigNumber = (value: any) => {
    return (
        isUndefinedOrNullOrObjectEmpty(value) ||
        isUndefinedOrNullOrBooleanFalse(BigNumber.isBigNumber(value))
    );
};

export const toMili = (hours: number, minutes: number, seconds: number) => {
    return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
};

export const wait = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

export const uc = (text: string) => `${text.substring(0, 1).toUpperCase()}${text.substring(1)}`;

export const NLStyleSheetCreator = <T extends NLStyleSheet>(arg: T): T => {
    return arg;
};

export const safeNavigate = (url: string) => (window.location.href = url);

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
    try {
        return getAddress(value);
    } catch {
        return false;
    }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
    const parsed = isAddress(address);
    if (!parsed) {
        throw Error(`Invalid 'address' parameter '${address}'.`);
    }
    return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function shortenTxnHash(address: string, chars = 4): string {
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const sortByField = <T>(array: T[], field: keyof T, asc: boolean = true) => {
    const compare = (a: T, b: T) => {
        return asc ? (a[field] < b[field] ? 1 : -1) : a[field] > b[field] ? 1 : -1;
    };
    return array.sort(compare);
};

export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// export const unCamelize = (text: string) => {
//     const firstWord = `${text.substr(0, 1).toUpperCase()}${
//         text.substring(1).match(/([a-z])+/g)[0]
//     }`;
//     return `${firstWord}${text
//         .substring(firstWord.length)
//         .match(/([A-Z])*([a-z])*/g)
//         .map((occurence) => ` ${occurence}`)
//         .join('')}`;
// };

export const cipher = (text: string) => {
    let textToChars = (text: any) => text.split('').map((c: any) => c.charCodeAt(0));
    let byteHex = (n: any) => ('0' + Number(n).toString(16)).substr(-2);
    let applySaltToChar = (code: any) =>
        textToChars(config.SALT).reduce((a: any, b: any) => a ^ b, code);

    return text.split('').map(textToChars).map(applySaltToChar).map(byteHex).join('');
};

// const decipher = (encoded: string) => {
//     let textToChars = (text: any) => text.split('').map((c: any) => c.charCodeAt(0));
//     let applySaltToChar = (code: any) =>
//         textToChars(config.SALT).reduce((a: any, b: any) => a ^ b, code);

//     return encoded
//         .match(/.{1,2}/g)
//         .map((hex) => parseInt(hex, 16))
//         .map(applySaltToChar)
//         .map((charCode) => String.fromCharCode(charCode))
//         .join('');
// };

export const loadFromLocalStorage = (target: string, encrypt = true) => {
    try {
        const serializedObject = localStorage.getItem(target);

        if (serializedObject === null) {
            return undefined;
        }
        let res = JSON.parse(encrypt ? serializedObject : serializedObject);
        return res;
    } catch (e) {
        console.log(e);
        return undefined;
    }
};

export const saveToLocalStorage = (obj: object, target: string = 'tokens', encrypt = true) => {
    try {
        const serializedObject = encrypt ? cipher(JSON.stringify(obj)) : JSON.stringify(obj);
        localStorage.setItem(target, serializedObject);
    } catch (e) {
        console.log('saveToLocalStorage', e);
    }
};

export const saveStringToLocalStorage = (str: string, target: string = 'tokens') => {
    try {
        localStorage.setItem(target, str);
    } catch (e) {
        console.log(e);
    }
};

export const loadStringFromLocalStorage = (target: string = 'tokens') => {
    try {
        return localStorage.getItem(target);
    } catch (e) {
        console.log(e);
    }
};

export const ucFirst = (value: string) => {
    return `${value.charAt(0).toUpperCase()}${value.substring(1)}`;
};

export const smartInsert = <
    T extends {
        index: number;
    },
>(
    array: T[],
    element: T,
): T[] => {
    if (array === undefined) {
        return [element];
    }
    if (element.index === array.length) {
        return [...array, element];
    }
    return array.reduce((acc: T[], elem) => {
        if (elem.index === element.index) {
            acc.push(element);
            elem.index++;
        }
        if (elem.index >= element.index) {
            elem.index++;
        }
        acc.push(elem);
        return [...acc, elem];
    }, []);
};

export const smartInsertIndex = <
    T extends {
        index: number;
    },
>(
    array: T[],
    element: T,
) => {
    if (array === undefined) {
        return [element];
    }
    if (element.index === array.length) {
        return [...array, element];
    }
    return array.reduce((acc: T[], elem) => {
        if (elem.index === element.index) {
            acc.push(element);
            elem.index++;
        }
        if (elem.index >= element.index) {
            elem.index++;
        }
        acc.push(elem);
        return acc;
    }, []);
};

export const smartRemove = <T extends { index: number }>(array: T[], element: T) => {
    if (array === undefined) {
        return [];
    }
    return array.reduce((acc: T[], elem) => {
        if (elem.index === element.index) {
            return acc;
        }
        if (elem.index > element.index) {
            elem.index--;
        }
        acc.push(elem);
        return acc;
    }, []);
};

export const smartReplace = <T extends { id: string }>(array: T[], element: T) => {
    if (array === undefined) {
        return [];
    }
    return array.reduce((acc: T[], elem) => {
        if (elem.id === element.id) {
            acc.push({
                ...elem,
                ...element,
            });
        } else {
            acc.push(elem);
        }
        return acc;
    }, []);
};

export const toGwei = (num: string): ethers.BigNumber => {
    return ethers.utils.parseUnits(num, 'gwei');
};

export const safeResetLocalStorage = (keys: string[]) => {
    const values: { key: string; value: string | null | undefined }[] = [];
    keys.forEach((key) => {
        values.push({
            key,
            value: loadStringFromLocalStorage(key),
        });
    });
    localStorage.clear();
    values.forEach((entry) => {
        if (entry.value !== undefined && entry.value !== null) {
            saveStringToLocalStorage(entry.value, entry.key);
        }
    });
};

export const createItemId = (itemId: string | number) => {
    return `${constants.ID_PREFIX_ITEM}${itemId.toString().replace(constants.ID_PREFIX_ITEM, '')}`;
};

export const extractItemId = (itemId: string) => {
    if (itemId && itemId.startsWith(constants.ID_PREFIX_ITEM)) {
        return itemId.replace(constants.ID_PREFIX_ITEM, '');
    }
    return itemId;
};

export const parseTokenId = (itemId: string, long?: boolean) => {
    if (itemId && itemId.startsWith(constants.ID_PREFIX_ITEM)) {
        let num = +itemId.replace(constants.ID_PREFIX_ITEM, '');
        return `${['Base', 'Eyes', 'Mouth', 'Hair', 'Hat', 'Back', 'Neck', 'Hold'][num >> 8]} ${
            long ? '#' : ''
        }${num & 0xff}`;
    } else {
        return `${long ? 'Nugg #' : ''}${itemId}`;
    }
};

export const parseTokenIdSmart = (itemId: string) => {
    if (!itemId) return '';
    if (itemId.startsWith(constants.ID_PREFIX_ITEM)) {
        let num = +itemId.replace(constants.ID_PREFIX_ITEM, '');
        return `${['Base', 'Eyes', 'Mouth', 'Hair', 'Hat', 'Back', 'Neck', 'Hold'][num >> 8]} ${
            num & 0xff
        }`;
    } else {
        return 'Nugg ' + itemId;
    }
};

export const parseItmeIdToNum = (itemId: `item-${string}`) => {
    const num = +itemId.replace('item-', '');
    return {
        feature: num >> 8,
        position: num & 0xff,
    };
};

export const padToAddress = (id: string) => {
    return ethers.utils.hexZeroPad(BigNumber.from(id)._hex, 20);
};

export const formatItemSwapIdForSend = (id: string | string[]) => {
    let arr = id;

    console.log({ arr });
    if (!isUndefinedOrNullOrStringEmpty(id)) {
        arr = (id as string).split('-');
    }
    return BigNumber.from(arr[constants.ITEM_ID_POS]).shl(24).or(arr[constants.ITEM_NUGG_POS]);
};

export const range = (start: number, end: number) => {
    if (end < start) {
        return [];
    }
    return Array(end - start + 1)
        .fill(0)
        .map((_, idx) => start + idx);
};

export const rangeStart = (start: number, end: number) => {
    if (end < start) {
        return [];
    }
    return Array(end - start)
        .fill(0)
        .map((_, idx) => start + idx);
};
export const rangeEnd = (start: number, end: number) => {
    if (end < start) {
        return [];
    }
    return Array(end - start)
        .fill(0)
        .map((_, idx) => start + 1 + idx);
};

export default { colors, constants, conversion, fontSize, layout, parse };
