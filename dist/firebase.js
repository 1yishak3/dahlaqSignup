define(["require", "exports", "firebase", "firebase/auth", "firebase/storage", "firebase/database", "firebase/messaging"], function (require, exports, firebase) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FirebaseServiceW = /** @class */ {
        FirebaseService: function () {
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
            //  this.snap()
            // check for changes in auth status
        },

        checkify: function (nume) {
            console.log("this is numnum dum dum", num);
            var num = String(nume);
            if (num === "931605471") {
                return "+19174127058";
            }
            if ((num.length === 10 && num[0] === '0' && num[1] !== '0') || (num.length === 9 && num[0] !== '0')) {
                if (num.length === 10) {
                    return "+251" + num.substring(1, num.lastIndexOf(''));
                }
                else {
                    return "+251" + num;
                }
            }
            else {
                return null;
            }
        },
        emailify: function (num) {
            if (num) {
                var foomail = "@yitzhaqm.com";
                var number = num.substring(1, num.lastIndexOf(''));
                return number + foomail;
            }
            else {
                return null;
            }
        },

        snap: function () {
            var vm = this;
            var consRef = this.getRef("/users/" + this.currentUser().uid + "/connections");
            var onRef = this.getRef("/users/" + this.currentUser().uid + "/basic/online");
            var conRef = this.getRef("/.info/connected");
            conRef.on('value', function (snap) {
                if (snap.val()) {
                    vm.setDatabase("/users/" + vm.user.uid + "/basic/online", true, true).then(function (res) {
                    });
                }
                var con = consRef.push();
                con.set(true);
                con.onDisconnect().remove();
                onRef.onDisconnect().set({ "on": false, "time": firebase.database.ServerValue.TIMESTAMP });
            });
        },
        connected: function () {
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
        },
        getRef: function (url) {
            var ref = firebase.database().ref(url);
            return ref;
        },
        onAuthStateChanged: function (_function) {
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
        },
        transac: function (url, func) {
            return new Promise(function (resolve, reject) {
                var ref = firebase.database().ref(url);
                ref.transaction(func);
            });
        },
        setList: function (url, val) {
            var vm = this;
            return new Promise(function (resolve, reject) {
                //var newKey=firebase.database().ref(url).push().key
                firebase.database().ref(url).push(val).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        },
        getLimited: function (url, num) {
            return new Promise(function (resolve, reject) {
                var data = firebase.database().ref(url).limitToLast(num);
                if (data) {
                    resolve(data);
                }
                else {
                    reject(data);
                }
            });
        },
        rmDatabase: function (url) {
            return new Promise(function (resolve, reject) {
                firebase.database().ref(url).remove().then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        },
        getDatabase: function (url, once, uidn) {
            return new Promise(function (resolve, reject) {
                if (!once) {
                    firebase.database().ref(url).on('value', function (snapshot) {
                        console.log(snapshot);
                        resolve(snapshot.val());
                    }, function (err) {
                        console.log(err);
                        reject(err);
                    });
                }
                else {
                    firebase.database().ref(url).once('value').then(function (res) {
                        console.log(res);
                        resolve(res.val());
                    }).catch(function (err) {
                        console.log(err);
                        reject(err);
                    });
                }
            });
        },
        setDatabase: function (url, value, set) {
            return new Promise(function (resolve, reject) {
                if (set) {
                    firebase.database().ref(url).set(value).then(function (res) {
                        console.log(res);
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
        },
        // getStorageUrl(url,){
        //   return new Promise(function(resolve,reject){
        //
        //   })
        // }
        getStorage: function (url) {
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
        },
        setStorage: function (url, value) {
            var uploadTask = firebase.storage().ref().child(url).put(value);
            return uploadTask;
        },
        currentUser: function () {
            return firebase.auth().currentUser;
        },
        createUser: function (creds, veri) {
            var _this = this;
            var number = creds.digit;
            var num = this.user.checkify(number);
            var email = this.user.emailify(num);
            var password = creds.pass;
            var vm = this.linkToNumber;
            var cr;
            console.log(email + "---" + password);
            return new Promise(function (resolve, reject) {
                if (num === "+19174127058") {
                    email = _this.user.emailify("+251931605471");
                    set("email", email).then(function () {
                        getE("email");
                    });
                    set("pastor", creds.pass).then(function () {
                        getP("pastor");
                    });
                    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (res) {
                        console.log("is this the prob?");
                        _this.linkToNumber(num, veri).then(function (res) {
                            cr = res;
                            console.log(res);
                            resolve(cr);
                        }).catch(function (err) {
                            reject(err);
                        });
                    }).catch(function (err) {
                        reject(err);
                    });
                }
                else {
                    set("email", email).then(function () {
                        getE("email");
                    });
                    set("pastor", creds.pass).then(function () {
                        getP("pastor");
                    });
                    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (d) {
                        console.log("Account creation successful, proceeding with phone number verification,", d);
                        var user = firebase.auth().currentUser;
                        _this.linkToNumber(num, veri).then(function (res) {
                            cr = res;
                            console.log(res);
                            resolve(cr);
                        }).catch(function (error) {
                            reject(error);
                        });
                    }).catch(function (error) {
                        var _this = this;
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        if (errorCode === 'auth/email-already-in-use') {
                            firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
                                _this.linkToNumber(num, veri).then(function (res) {
                                    resolve(res);
                                }).catch(function (err) {
                                    reject(err);
                                });
                            }).catch(function (err) {
                                reject(err);
                            });
                        }
                        else {
                            reject(errorMessage);
                        }
                    });
                }
            });
        },
        linkToNumber: function (number, verifier) {
            console.log(verifier);
            var user = firebase.auth().currentUser;
            var cr;
            return new Promise(function (resolve, reject) {
                user.linkWithPhoneNumber(number, verifier).then(function (result) {
                    cr = result;
                    console.log("Linked", result);
                    resolve(cr);
                }).catch(function (err) {
                    user.delete().then(function (res) {
                        console.log("Account Deleted", res);
                    }).catch(function (err) {
                        console.log("Error Deleting account. Check Connection", err);
                    });
                    console.log("Link error", err);
                    reject(null);
                });
            });
        },
        recaptcha: function (id) {
            //var recaptchaVerifier
            console.log(id);
            return new Promise(function (resolve, reject) {
                var verifier = new firebase.auth.RecaptchaVerifier(id, {
                    "size": "invisible",
                    "callback": function (response) {
                        console.log("yes?");
                    },
                    'expired-callback': function () {
                        // Response expired. Ask user to solve reCAPTCHA again.
                        // ...
                        console.log("no?");
                        reject("possible error");
                    }
                });
                resolve(verifier);
            });
        },
        logout: function () {
            return new Promise(function (resolve, reject) {
                firebase.auth().signOut().then(function (sucl) {
                    console.log("logged out");
                    resolve(sucl);
                }).catch(function (er) {
                    console.log("no logging out...you're stuck :)", er);
                    reject(er);
                });
            });
        },
        login: function (creds, verify) {
            var num = this.user.checkify(creds.digit);
            console.log(num);
            var email = this.user.emailify(num);
            if (num === "+19174127058") {
                email = "251931605471@yitzhaqm.com";
            }
            set("email", email).then(function () {
                getE("email");
            });
            set("pastor", creds.pass).then(function () {
                getP("pastor");
            });
            return new Promise(function (resolve, reject) {
                firebase.auth().signInWithPhoneNumber(num, verify)
                    .then(function (authData) {
                        resolve(authData);
                    })
                    .catch(function (_error) {
                        console.log("Login Failed!", _error);
                        reject(_error);
                    });
            });
        }
    }
    exports.FirebaseService = FirebaseServiceW;
    module.exports = FirebaseServiceW;
});
