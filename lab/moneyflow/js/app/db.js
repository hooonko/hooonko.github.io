define([
    "jquery"
], function($) {



    var moneyflow = {};

    moneyflow.dbConfig = {
        version : 1,
        dbName : "moneyIO",
        dataType : {
            io : "io",
            type : "type",
            method : "method"
        }
    };

    // In the following line, you should include the prefixes of implementations you want to test.
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

    if (!window.indexedDB) {
        moneyflow.dbResult.error = true;
        moneyflow.dbResult.data = {
            message : "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
        }
        return moneyflow.dbResult;
    }








    moneyflow.indexedDB = {};
    moneyflow.indexedDB.db = null;

    moneyflow.indexedDB.onerror = function(e) {
        if (e.type === 'error' && e.target && e.target.error) {
            moneyflow.indexedDB.printLog('[' + e.target.error.name + '] ' + e.target.error.message);
        } else {
            moneyflow.indexedDB.printLog(JSON.stringify(e, undefined, 2));
        }
    };

    moneyflow.indexedDB.setLoggingDom = function(dom) {
        moneyflow.indexedDB.loggingDom = dom;
        $(dom).on('log', function(event, msg) {
            $('#logWrap').append(msg + '\n');
        });
    };

    moneyflow.indexedDB.printLog = function(msg) {
        $(moneyflow.indexedDB.loggingDom).trigger('log', msg);
    };

    moneyflow.indexedDB.open = function(callback) {
        var request = indexedDB.open(moneyflow.dbConfig.dbName, moneyflow.dbConfig.version);

        // We can only create Object stores in a versionchange transaction.
        request.onupgradeneeded = function(e) {
            moneyflow.indexedDB.printLog("DB Upgrading..");

            // The database did not previously exist, so create object stores and indexes.
            var db = e.target.result;

            // A versionchange transaction is started automatically.
            request.transaction.onerror = moneyflow.indexedDB.onerror;


            if(db.objectStoreNames.contains(moneyflow.dbConfig.dataType.io)) {
                db.deleteObjectStore(moneyflow.dbConfig.dataType.io);
            }
            var store = db.createObjectStore(moneyflow.dbConfig.dataType.io, {keyPath: "id"});

            if(db.objectStoreNames.contains(moneyflow.dbConfig.dataType.type)) {
                db.deleteObjectStore(moneyflow.dbConfig.dataType.type);
            }
            store = db.createObjectStore(moneyflow.dbConfig.dataType.type, {keyPath: "id"});


            if(db.objectStoreNames.contains(moneyflow.dbConfig.dataType.method)) {
                db.deleteObjectStore(moneyflow.dbConfig.dataType.method);
            }
            store = db.createObjectStore(moneyflow.dbConfig.dataType.method, {keyPath: "id"});
        };

        request.onsuccess = function(e) {
            moneyflow.indexedDB.db = e.target.result;
            moneyflow.indexedDB.printLog("Opened DB successfully");
            if (typeof callback === 'function') {
                callback();
            }
        };

        request.onerror = moneyflow.indexedDB.onerror;
    };

    moneyflow.indexedDB.dropdatabase = function() {
        if (moneyflow.indexedDB.db)
            moneyflow.indexedDB.db.close();
        var req = window.indexedDB.deleteDatabase(moneyflow.dbConfig.dbName);
        req.onsuccess = function (e) {
            moneyflow.indexedDB.printLog("Deleted database successfully");
        };
        req.onerror = function (e) {
            moneyflow.indexedDB.printLog("Couldn't delete database\n" + JSON.stringify(e, undefined, 2));
        };
        req.onblocked = function (e) {
            moneyflow.indexedDB.printLog("Couldn't delete database due to the operation being blocked\n" + JSON.stringify(e, undefined, 2));
        };
    }



    moneyflow.indexedDB.addType = function(param) {
        moneyflow.indexedDB.add(moneyflow.dbConfig.dataType.type, param);
    };
    moneyflow.indexedDB.addMethod = function(param) {
        moneyflow.indexedDB.add(moneyflow.dbConfig.dataType.method, param);
    };
    moneyflow.indexedDB.addIO = function(param) {
        moneyflow.indexedDB.add(moneyflow.dbConfig.dataType.io, param);
    };
    moneyflow.indexedDB.add = function(type, param) {
        var db = moneyflow.indexedDB.db;
        var trans = db.transaction([type], "readwrite");
        var store = trans.objectStore(type);

        var data = param.data;

        var request = store.put(data);

        trans.oncomplete = function(e) {
            if ($.isFunction(param.success)) {
                param.success();
            } else {
                moneyflow.indexedDB.printLog("param.success is not a function!");
            }
        };

        request.onerror = function(e) {
            moneyflow.indexedDB.printLog("Error Adding: ", JSON.Stringify(e, undefined, 2));
        };
    };

    moneyflow.indexedDB.deleteType = function(param) {
        moneyflow.indexedDB.delete(moneyflow.dbConfig.dataType.type, param);
    };
    moneyflow.indexedDB.deleteMethod = function(param) {
        moneyflow.indexedDB.delete(moneyflow.dbConfig.dataType.method, param);
    };
    moneyflow.indexedDB.deleteIO = function(param) {
        moneyflow.indexedDB.delete(moneyflow.dbConfig.dataType.io, param);
    };
    moneyflow.indexedDB.delete = function(type, param) {
        var db = moneyflow.indexedDB.db;
        var trans = db.transaction([type], "readwrite");
        var store = trans.objectStore(type);

        var request = store.delete(param.data.key);

        trans.oncomplete = function(e) {
            if ($.isFunction(param.success)) {
                param.success();
            } else {
                moneyflow.indexedDB.printLog("param.success is not a function!");
            }
        };

        request.onerror = function(e) {
            moneyflow.indexedDB.printLog("Error Deleting: ", JSON.Stringify(e, undefined, 2));
        };
    };

    moneyflow.indexedDB.getAllType = function(callback) {
        moneyflow.indexedDB.getAll(moneyflow.dbConfig.dataType.type, callback);
    };
    moneyflow.indexedDB.getAllMethod = function(callback) {
        moneyflow.indexedDB.getAll(moneyflow.dbConfig.dataType.method, callback);
    };
    moneyflow.indexedDB.getAllIO = function(callback) {
        moneyflow.indexedDB.getAll(moneyflow.dbConfig.dataType.io, callback);
    };
    moneyflow.indexedDB.getAll = function(dataType, callback) {

        moneyflow.indexedDB.printLog("getAll(" + dataType + ") Start!");

        var db = moneyflow.indexedDB.db;

        var trans = db.transaction([dataType], "readwrite");
        var store = trans.objectStore(dataType);

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        var typeItems = new Array();
        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if(!!result == false) {

                moneyflow.indexedDB.printLog("getAll(" + dataType + ") Finished!");
                if ($.isFunction(callback)) {
                    callback(typeItems);
                } else {
                    moneyflow.indexedDB.printLog("callback is not a function!");
                }
                return;
            }

            typeItems.push({
                key: result.key,
                value: result.value
            });

            result.continue();
        };

        cursorRequest.onerror = moneyflow.indexedDB.onerror;
    };

    return moneyflow;
});
    