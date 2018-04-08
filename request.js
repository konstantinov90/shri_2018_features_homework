// const fetch = require('node-fetch');


class GetPromise extends Promise {
    static fetch(url, opts) {
        return GetPromise.resolve(fetch(url, opts));
    }
}

class SuccessPromise extends Promise {}

class Request {
    constructor() {
        this.promise = Promise.resolve();
    }

    /**
     * private
     * Накинуть колбек в очередь промисов
     * 
     * @param {Function} cb колбек
     */
    chain(cb) {
        this.promise = this.promise.then(cb)
    }

    /**
     * public
     * Статический метод, начинающий цепочку запросов
     * 
     * @param {String} url URL начального запроса
     * @return {Request} новый инстанс
     */
    static start(url) {
        const instance = new Request();
        instance.chain(() => GetPromise.fetch(url));
        return instance;
    }

    /**
     * public
     * Обработка успешного запроса
     * 
     * @param {Function} cb колбек для обработки результата предыдущего запроса
     * @return {Request} this
     */
    success(cb) {
        if (!this.promise instanceof GetPromise && !this.promise instanceof SuccessPromise) {
            console.error(new Error(`success нельзя вызывать после ${this.promise.constructor.name}!`));
        }
        this.chain((...args) => SuccessPromise.resolve(cb(...args)));
        return this;
    }

    /**
     * public
     * Сделать очередной GET запрос
     * 
     * @param {Function | String} urlOrPrepUrl URL в виде строки или функция,
     * возвращающая строку URL на основании полученных от предыдущей оперции данных
     * @return {Request} this
     */
    get(urlOrPrepUrl, options) {
        if (urlOrPrepUrl instanceof Function) {
            this.chain((...args) => SuccessPromise.resolve(urlOrPrepUrl(...args)));
            this.chain((url) => GetPromise.fetch(url, options));
        } else {
            this.chain(() => GetPromise.fetch(urlOrPrepUrl));
        }
        return this;
    }

    /**
     * Обработка ошибки
     * 
     * @param {Function} cb Обработчик ошибки, можно дисрегардить ошибку и вернуть результат
     * @return {Request} this
     */
    error(cb) {
        this.promise = this.promise.catch(cb);
        return this;
    }

    /**
     * public
     * Закрывает цепочку вызовов
     * 
     * @return {Promise} промис последней в очереди операции
     */
    finish() {
        return this.promise;
    }
}



// Request
//     .start('http://ya.ru')
//     .success(text => {
//         console.log(text.slice(0, 100));
//         console.log('yaru');
//         return text;
//     })
//     .get(yaru => {
//         console.log(yaru.length);
//         return 'http://google.com'
//     })
//     .success(goog => {
//         console.log(goog.slice(0, 100));
//         console.log('goog', goog.length);
//     })
//     .get('bullshiturl')
//     .success(()=>{
//         console.log('you will not see this');
//     })
//     .error(err => {
//         console.error(err);
//         const fallbackUrl = 'http://yahoo.com';
//         return fallbackUrl;
//     })
//     .get(url => url)
//     .success(yaho => {
//         console.log(yaho.slice(0, 100));
//         console.log('yaho', yaho.length);
//     })
//     .finish()
//     .then(()=>console.log('done'));
