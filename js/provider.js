/**
 *
 * @abstract: Reference to the code on github：https://github.com/luics/web-dev/tree/master/examples/data
 *
 */

(function() {
    let model = window.model;
    let storage = window.localStorage;

    Object.assign(model, {
        init: function(callback) {
            let data = storage.getItem(model.TOKEN);
            try {
                if (data) model.data = JSON.parse(data);
            }
            catch (e) {
                storage.setItem(model.TOKEN, '');
                console.error(e);
            }

            if (callback) callback();
        },
        flush: function(callback) {
            try {
                storage.setItem(model.TOKEN, JSON.stringify(model.data));
            }
            catch (e) {
                console.error(e);
            }
            if (callback) callback();
        }
    });
})();