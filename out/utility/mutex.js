"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutex = void 0;
class Mutex {
    constructor() {
        this.mutex = Promise.resolve();
    }
    lock() {
        let begin = () => {
            //
        };
        this.mutex = this.mutex.then(() => {
            return new Promise(begin);
        });
        return new Promise(res => {
            begin = res;
        });
    }
    async dispatch(fn) {
        const unlock = await this.lock();
        try {
            return await Promise.resolve(fn());
        }
        finally {
            unlock();
        }
    }
}
exports.Mutex = Mutex;
//# sourceMappingURL=mutex.js.map