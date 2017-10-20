"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("rxjs/Rx");
var firebase = require("firebase");
require("firebase/auth");
require("firebase/storage");
require("firebase/database");
require("firebase/messaging");
var FirebaseService = /** @class */ (function () {
    function FirebaseService(stg, lc, usr, events) {
        this.stg = stg;
        this.lc = lc;
        this.usr = usr;
        this.events = events;
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyCYT5qaezgIxItyCT_idaM0rXNnKA9eBMY",
            authDomain: "dahlaq-c7e0f.firebaseapp.com",
            databaseURL: "https://dahlaq-c7e0f.firebaseio.com",
            projectId: "dahlaq-c7e0f",
            storageBucket: "dahlaq-c7e0f.appspot.com",
            messagingSenderId: "500593695235"
        };
        firebase.initializeApp(config);
        this.user = usr;
        this.ev = events;
        this.userCheck = new core_1.EventEmitter;
        this.messaging = firebase.messaging();
        //  this.nexmo=new NexmoVerify({appId:"1042dab6",sharedSecret:"ab54c189dc474c91"})
        //  this.snap()
        // check for changes in auth status
    }
    FirebaseService.prototype.getAuth = function () {
        return firebase.auth();
    };
    FirebaseService.prototype.getPermissionAndToken = function () {
        var vm = this;
        return new Promise(function (resolve, reject) {
            console.log("onpromise");
            vm.messaging.onTokenRefresh(function (d) {
                console.log("refresed");
                vm.messaging.getToken()
                    .then(function (refreshedToken) {
                    console.log('Token refreshed.', refreshedToken);
                    // Indicate that the new Instance ID token has not yet been sent to the
                    // app server.
                    // ...
                    resolve(refreshedToken);
                })
                    .catch(function (err) {
                    console.log('Unable to retrieve refreshed token ', err);
                });
            }, function () {
                console.log("something has occured");
            });
            // ...
        });
    };
    FirebaseService.prototype.snap = function () {
        if (this.currentUser()) {
            var vm = this;
            var consRef = this.getRef("/users/" + this.currentUser().uid + "/connections");
            var onRef = this.getRef("/users/" + this.currentUser().uid + "/basic/online");
            var conRef = this.getRef("/.info/connected");
            conRef.on('value', function (snap) {
                if (snap.val()) {
                    vm.setDatabase("/users/" + this.currentUser().uid + "/basic/online", { "on": true, "time": firebase.database.ServerValue.TIMESTAMP }, true).then(function (res) {
                    });
                }
                var con = consRef.push();
                con.set(true);
                con.onDisconnect().remove();
                onRef.onDisconnect().set({ "on": false, "time": firebase.database.ServerValue.TIMESTAMP });
            });
        }
    };
    FirebaseService.prototype.connected = function () {
        return new Promise(function (resolve, reject) {
            firebase.database().ref(".info/connected").on("value", function (snap) {
                if (snap.val() === true || snap.val() === false) {
                    resolve(snap.val());
                }
                else {
                    reject("problems with .info/connected");
                }
            });
        });
    };
    FirebaseService.prototype.getRef = function (url) {
        var ref = firebase.database().ref(url);
        return ref;
    };
    FirebaseService.prototype.onAuthStateChanged = function (_function) {
        return firebase.auth().onAuthStateChanged(function (_currentUser) {
            if (_currentUser) {
                console.log("User " + _currentUser.uid + " is logged in with " + _currentUser.providerData);
                _function(_currentUser);
            }
            else {
                console.log("User is logged out");
                _function(null);
            }
        });
    };
    FirebaseService.prototype.firebaseAuth = function () {
        return firebase.auth();
    };
    FirebaseService.prototype.transac = function (url, func) {
        return new Promise(function (resolve, reject) {
            var ref = firebase.database().ref(url);
            ref.transaction(func);
        });
    };
    FirebaseService.prototype.setList = function (url, val) {
        var vm = this;
        return new Promise(function (resolve, reject) {
            //var newKey=firebase.database().ref(url).push().key
            var ref = firebase.database().ref(url).push();
            var key = ref.key;
            vm.setDatabase(url + "/" + key, val, true).then(function (res) {
                resolve(key);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    FirebaseService.prototype.getLimited = function (url, num, by) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.stg.get('recentFiftiCache').then(function (snap) {
                if (snap) {
                    firebase.database().ref(url.substring(0, url.lastIndexOf("/")) + "/mCache").once("value", function (snaperro) {
                        if (snap !== snaperro.val()) {
                            firebase.database().ref(url).orderByChild(by).limitToLast(num).on("value", function (snapshot) {
                                // This callback will be triggered exactly two times, unless there are
                                // fewer than two dinosaurs stored in the Database. It will also get fired
                                // for every new, heavier dinosaur that gets added to the data set.
                                console.log(snapshot.key);
                                resolve(snapshot.val());
                            }, function (err) {
                                reject(err);
                            });
                        }
                        else {
                            _this.stg.get('recentFifti').then(function (tin) {
                                resolve(tin);
                            });
                        }
                    }).catch(function (err) {
                        console.log("no connection maybe?");
                        _this.stg.get('recentFifti').then(function (tin) {
                            resolve(tin);
                        });
                    });
                }
                else {
                    firebase.database().ref(url).orderByChild(by).limitToLast(num).on("value", function (snapshot) {
                        // This callback will be triggered exactly two times, unless there are
                        // fewer than two dinosaurs stored in the Database. It will also get fired
                        // for every new, heavier dinosaur that gets added to the data set.
                        console.log(snapshot.key);
                        resolve(snapshot.val());
                    }, function (err) {
                        reject(err);
                    });
                }
            });
        });
    };
    FirebaseService.prototype.rmDatabase = function (url) {
        return new Promise(function (resolve, reject) {
            firebase.database().ref(url).remove().then(function (res) {
                resolve(res);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    FirebaseService.prototype.getDatabase = function (url, once, ctrl) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.stg.get(url + "/cache").then(function (c) {
                if (c) {
                    firebase.database().ref(url + "/cache").once('value').then(function (res) {
                        console.log(res.val());
                        console.log(c);
                        if (res.val()) {
                            if (res.val() !== c) {
                                console.log("Jesus Lord save me", res.val(), c);
                                if (ctrl) {
                                    var load = _this.lc.create({
                                        content: "Getting new stuff..."
                                    });
                                    load.present();
                                }
                                console.log("How are you even here");
                                firebase.database().ref(url).once('value').then(function (r) {
                                    console.log("This is res from fuckit", r.val());
                                    if (ctrl) {
                                        load.dismiss();
                                    }
                                    var x = r.val();
                                    if (x) {
                                        _this.stg.set(url + "/cache", x.cache).then(function () {
                                            _this.stg.get(url).then(function (res) {
                                                var what = x || res;
                                                _this.stg.set(url, what);
                                            });
                                        });
                                        resolve(r.val());
                                    }
                                    else {
                                        resolve(null);
                                    }
                                }).catch(function (err) {
                                    console.log(err);
                                    if (ctrl) {
                                        load.dismiss();
                                    }
                                    reject(err);
                                });
                            }
                            else {
                                console.log("here????");
                                _this.stg.get(url).then(function (w) {
                                    console.log(w);
                                    if (!w) {
                                        console.log("Not w?");
                                        firebase.database().ref(url).once('value').then(function (r) {
                                            console.log("This is res from fuckit", r.val());
                                            var x = r.val();
                                            if (x) {
                                                _this.stg.remove(url + "/cache");
                                                _this.stg.set(url + "/cache", x.cache).then(function () {
                                                    _this.stg.get(url).then(function (res) {
                                                        var what = x || res;
                                                        _this.stg.set(url, what);
                                                    });
                                                });
                                                resolve(r.val());
                                            }
                                            else {
                                                resolve(null);
                                            }
                                        }).catch(function (err) {
                                            console.log(err);
                                            reject(err);
                                        });
                                    }
                                    else {
                                        resolve(w);
                                    }
                                }).catch(function (d) {
                                    reject("error");
                                });
                            }
                        }
                        else {
                            _this.stg.get(url).then(function (w) {
                                console.log(w);
                                if (!w) {
                                    console.log("Not w?");
                                    firebase.database().ref(url).once('value').then(function (r) {
                                        console.log("This is res from fuckit", r.val());
                                        var x = r.val();
                                        if (x) {
                                            //this.stg.remove(url+"/cache")
                                            _this.stg.set(url + "/cache", x.cache).then(function () {
                                                _this.stg.get(url).then(function (res) {
                                                    var what = x || res;
                                                    _this.stg.set(url, what);
                                                });
                                            });
                                            resolve(r.val());
                                        }
                                        else {
                                            resolve(null);
                                        }
                                    }).catch(function (err) {
                                        console.log(err);
                                        reject(err);
                                    });
                                }
                                else {
                                    resolve(w);
                                }
                            }).catch(function (d) {
                                reject("error");
                            });
                        }
                    });
                }
                else {
                    firebase.database().ref(url).once('value').then(function (r) {
                        console.log("This is res from fuckit", r.val());
                        //if(ctrl){load.dismiss()}
                        var x = r.val();
                        if (x) {
                            _this.stg.set(url + "/cache", x.cache).then(function () {
                                _this.stg.get(url).then(function (res) {
                                    var what = x || res;
                                    _this.stg.set(url, what);
                                });
                            });
                            resolve(r.val());
                        }
                        else {
                            resolve(null);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        //if(ctrl){load.dismiss()}
                        reject(err);
                    });
                }
            });
        });
    };
    FirebaseService.prototype.setDatabase = function (url, value, set) {
        return new Promise(function (resolve, reject) {
            if (set) {
                firebase.database().ref(url).set(value).then(function (res) {
                    //console.log(res)
                    resolve(res);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            }
            else {
                //var val = {}
                //val[url]=value
                firebase.database().ref().update(value).then(function (res) {
                    console.log(res);
                    resolve(res);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            }
        });
    };
    // getStorageUrl(url,){
    //   return new Promise(function(resolve,reject){
    //
    //   })
    // }
    FirebaseService.prototype.getStorage = function (url) {
        return new Promise(function (resolve, reject) {
            var ref = firebase.storage().ref().child(url);
            ref.getDownloadURL().then(function (res) {
                console.log(res);
                var ress = res;
                resolve(ress);
            }).catch(function (err) {
                console.log(err);
                reject(err);
            });
        });
    };
    FirebaseService.prototype.setStorage = function (url, value, cam) {
        var uploadTask;
        if (cam) {
            uploadTask = firebase.storage().ref().child(url).putString(value, 'data_url');
        }
        else {
            uploadTask = firebase.storage().ref().child(url).put(value);
        }
        return uploadTask;
    };
    FirebaseService.prototype.currentUser = function () {
        return firebase.auth().currentUser;
    };
    FirebaseService.prototype.createUser = function (creds, pass, veri) {
        var _this = this;
        var number = creds.digits;
        var num = this.user.checkify(number);
        var email = this.user.emailify(num);
        var password = pass || this.user.passwordGen(number);
        var cr;
        console.log(email + "---" + password);
        return new Promise(function (resolve, reject) {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(function () {
                if (email === null) {
                    reject("notEthiopian");
                }
                firebase.auth().createUserWithEmailAndPassword(email, password).then(function (d) {
                    console.log("Account creation successful, proceeding with phone number verification,", d);
                    var user = firebase.auth().currentUser;
                    _this.stg.set("log", true).then(function (value) {
                        _this.stg.set("uzer", _this.currentUser()).then(function () {
                            resolve(email);
                        });
                    });
                }).catch(function (err) {
                    console.log("Account not created", err);
                    reject(err);
                });
            }).catch(function (err) {
                reject(err);
                console.log("created account");
            });
        });
    };
    FirebaseService.prototype.linkToNumber = function (number) {
        var user = firebase.auth().currentUser;
        var cr;
        var vm = this;
        return new Promise(function (resolve, reject) {
            var ver = vm.nexmo.verify(number).then(function () {
                resolve(vm.nexmo);
            }).catch(function () {
                reject(vm.nexmo);
            });
        });
    };
    FirebaseService.prototype.recaptcha = function (id) {
        //var recaptchaVerifier
        return new Promise(function (resolve, reject) {
            resolve(new firebase.auth.RecaptchaVerifier(id, {
                "size": "invisible",
                "callback": function (response) {
                },
            }));
        });
    };
    FirebaseService.prototype.logout = function () {
        return new Promise(function (resolve, reject) {
            firebase.auth().signOut().then(function (sucl) {
                console.log("logged out");
                resolve(sucl);
            }).catch(function (er) {
                console.log("no logging out...you're stuck :)", er);
                reject(er);
            });
        });
    };
    FirebaseService.prototype.login = function (e, p) {
        var _this = this;
        var email = e;
        var password = p;
        var vm = this;
        return new Promise(function (resolve, reject) {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(function () {
                // Existing and future Auth states are now persisted in the current
                // session only. Closing the window would clear any existing state even
                // if a user forgets to sign out.
                // ...
                // New sign-in will be persisted with session persistence.
                if (password && password !== "") {
                    firebase.auth().signInWithEmailAndPassword(email, password).then(function (res) {
                        console.log("is this the prob?");
                        resolve();
                    }).catch(function (err) {
                        _this.stg.set("log", false).then(function (value) {
                            reject(err);
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                }
                else {
                    reject("Password");
                }
            })
                .catch(function (error) {
                // Handle Errors .
                reject(error);
                var errorCode = error;
                var errorMessage = error.message;
            });
            // firebase.auth().signInWithPhoneNumber(num, verify)
            // .then(function(authData) {
            //   resolve(authData)
            // })
            // .catch(function(_error) {
            //   console.log("Login Failed!", _error);
            //   reject(_error)
            // })
        });
    };
    FirebaseService = __decorate([
        core_1.Injectable()
    ], FirebaseService);
    return FirebaseService;
}());
exports.FirebaseService = FirebaseService;
//# sourceMappingURL=firebase.js.map