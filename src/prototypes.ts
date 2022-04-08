/* eslint-disable no-param-reassign */
/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrStringEmpty,
} from './lib';

// eslint-disable-next-line @typescript-eslint/unbound-method
// const _getBBox = SVGGraphicsElement.prototype.getBBox;

// SVGGraphicsElement.prototype.getBBox = function fn() {
//     let tempSvg: Node;
//     if (document.contains(this)) {
//         return _getBBox.apply(this);
//     }
//     const tempDiv = document.createElement('div');
//     tempDiv.setAttribute('style', 'position:absolute; visibility:hidden; width:0; height:0');
//     if (this.tagName === 'svg') {
//         tempSvg = this.cloneNode(true);
//     } else {
//         tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
//         tempSvg.appendChild(this.cloneNode(true));
//     }
//     tempDiv.appendChild(tempSvg);
//     document.body.appendChild(tempDiv);
//     const bbox = _getBBox.apply(tempSvg);
//     document.body.removeChild(tempDiv);
//     return bbox;
// };

String.prototype.isItemId = function fn() {
    return ((input: string): input is `item-${string}` => {
        return input.startsWith('item-');
    })(this as string);
};

String.prototype.equals = function fn(other: string) {
    return this === other;
};

Array.prototype.mergeInPlace = function fn<T>(
    incomingData: Array<T>,
    keyFeild: keyof T,
    shouldOverride: (a: T, b: T) => boolean,
    sort: (a: T, b: T) => number,
) {
    const map = new Map<T[keyof T], number>();

    (this as Array<T>).forEach((x, i) => {
        map.set(x[keyFeild], i);
    });

    const unseen: T[] = [];

    incomingData.forEach((x) => {
        const check = map.get(x[keyFeild]);
        if (check === undefined) {
            unseen.push(x);
        } else if (shouldOverride((this as Array<T>)[check], x)) {
            (this as Array<T>)[check] = x;
        }
    });

    this.unshift(...unseen);
    if (sort) this.sort(sort);
};

Array.prototype.shuffle = function fn() {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
};

Array.prototype.filterInPlace = function fn(callbackfn, thisArg) {
    let ptr = 0;

    this.forEach((element, index) => {
        if (callbackfn.call(thisArg, element, index, this)) {
            if (index !== ptr) this[ptr] = element;
            ptr++;
        }
    }, this);

    this.length = ptr;
};

Array.prototype.first = function fn(count: number) {
    if (!this || this === []) {
        return undefined;
    }

    if (count === undefined) {
        return this.length > 0 ? this[0] : undefined;
    }

    return this.slice(0).reduce((result, element, i, arr) => {
        if (result.length < count) {
            result.push(element);
        } else {
            arr.splice(1);
        }
        return result;
    }, []);
};

Array.prototype.last = function fn(count?: number) {
    if (!this || this === []) {
        return undefined;
    }

    if (count === undefined) {
        return this[this.length - 1];
    }

    return this.slice(0)
        .reverse()
        .reduce((result, element, i, arr) => {
            if (result.length < count) {
                result.push(element);
            } else {
                arr.splice(1);
            }
            return result;
        }, [])
        .reverse();
};

Array.prototype.toggle = function fn<T>(element: T, field?: keyof T) {
    const val = [...this];
    if (isUndefinedOrNullOrArrayEmpty(val)) {
        return [element];
    }

    const index = val.findIndex((item: T) =>
        field ? item[field] === element[field] : item === element,
    );

    if (!isUndefinedOrNullOrNotNumber(index) && index >= 0) {
        val.splice(index, 1);
    } else {
        val.push(element);
    }
    return val;
};

Array.prototype.insert = function fn<T extends { index: number }>(element: T) {
    if (isUndefinedOrNullOrArrayEmpty(this)) {
        return [element];
    }
    if (typeof element === 'string') {
        if (this.indexOf(element) !== -1) {
            return this;
        }
        return [...this, element];
    }
    if (element.index === this.length) {
        return [...this, element];
    }
    return this.reduce((acc, elem) => {
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

Array.prototype.remove = function fn<T extends { index: number }>(element: T) {
    if (isUndefinedOrNullOrArrayEmpty(this)) {
        return [];
    }
    if (typeof element === 'string') {
        const temp = [...this];
        temp.splice(
            this.findIndex((item) => element === item),
            1,
        );
        return temp;
    }
    return this.reduce((acc, elem) => {
        if (elem.index === element.index) {
            return acc;
        }
        if (elem.index >= element.index) {
            elem.index--;
        }
        acc.push(elem);
        return acc;
    }, []);
};

Array.prototype.replace = function fn<T extends { id: string } | object>(
    element: T,
    field: keyof T,
) {
    if (isUndefinedOrNullOrArrayEmpty(this)) {
        return [];
    }
    return this.reduce((acc, elem) => {
        if (
            !isUndefinedOrNullOrStringEmpty(field)
                ? elem[field] === element[field]
                : elem.id === (element as any).id
        ) {
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

Array.prototype.smartInsert = function fn<T>(element: T, field?: keyof T) {
    if (
        !this.find((item) =>
            field !== undefined ? item[field] === element[field] : item === element,
        )
    ) {
        return [...this, element];
    }
    return this;
};

Array.prototype.smartRemove = function fn<T>(element: T, field?: keyof T) {
    const index = this.findIndex((item) =>
        field !== undefined ? item[field] === element[field] : item === element,
    );
    if (index === -1) {
        return this;
    }
    const temp = [...this];
    temp.splice(index, 1);
    return temp;
};
