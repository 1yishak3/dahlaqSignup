import {Injectable, EventEmitter} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";
import { User } from './user'
import { Events, LoadingController } from 'ionic-angular'
import { Uzer } from '../models/uzer'
import { Storage } from '@ionic/storage'

import * as firebase from "firebase";
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/database'
import 'firebase/messaging'






@Injectable()
export class FirebaseService {
  userCheck: EventEmitter<Boolean>
  authCallback: any;
  user: any
  ev: any
  messaging: any
  nexmo: any
  constructor(public stg:Storage, public lc?: LoadingController, public usr?: User, public events?: Events) {
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
    this.user = usr
    this.ev = events
    this.userCheck = new EventEmitter
    this.messaging = firebase.messaging()
    //  this.nexmo=new NexmoVerify({appId:"1042dab6",sharedSecret:"ab54c189dc474c91"})
    //  this.snap()
    // check for changes in auth status


  }
  getAuth(){
    return firebase.auth()
  }

  getPermissionAndToken() {
    var vm = this
    return new Promise(function(resolve, reject) {
          console.log("onpromise")
          vm.messaging.onTokenRefresh((d)=>{
            console.log("refresed")
            vm.messaging.getToken()
              .then(function(refreshedToken) {
                console.log('Token refreshed.',refreshedToken);
                // Indicate that the new Instance ID token has not yet been sent to the
                // app server.
                // ...
                resolve(refreshedToken)
              })
              .catch(function(err) {
                console.log('Unable to retrieve refreshed token ', err);
              });
          },()=>{
            console.log("something has occured")
          });

          // ...


    })
  }
  snap() {
    if(this.currentUser()){
    var vm = this
    var consRef = this.getRef("/users/" + this.currentUser().uid + "/connections")
    var onRef = this.getRef("/users/" + this.currentUser().uid+ "/basic/online")
    var conRef = this.getRef("/.info/connected")
    conRef.on('value', function(snap) {
      if (snap.val()) {

        vm.setDatabase("/users/" + this.currentUser().uid + "/basic/online", { "on": true, "time": firebase.database.ServerValue.TIMESTAMP }, true).then(function(res) {

          })
        }
        var con = consRef.push()
        con.set(true)
        con.onDisconnect().remove()
        onRef.onDisconnect().set({ "on": false, "time": firebase.database.ServerValue.TIMESTAMP })
      })
    }
  }
  connected() {
    return new Promise(function(resolve, reject) {
      firebase.database().ref(".info/connected").on("value", function(snap) {
        if (snap.val() === true || snap.val() === false) {
          resolve(snap.val())
        } else {
          reject("problems with .info/connected");
        }
      });
    })
  }
  getRef(url) {
    var ref: any = firebase.database().ref(url)
    return ref
  }
  onAuthStateChanged(_function) {
    return firebase.auth().onAuthStateChanged((_currentUser) => {
      if (_currentUser) {
        console.log("User " + _currentUser.uid + " is logged in with " + _currentUser.providerData);
        _function(_currentUser);
      } else {
        console.log("User is logged out");
        _function(null)
      }
    })
  }
  firebaseAuth() {
    return firebase.auth()
  }


  transac(url, func) {
    return new Promise(function(resolve, reject) {
      var ref = firebase.database().ref(url)
      ref.transaction(func)
    })
  }
  setList(url, val) {
    var vm = this
    return new Promise(function(resolve, reject) {
      //var newKey=firebase.database().ref(url).push().key
      var ref = firebase.database().ref(url).push()
      var key = ref.key
      vm.setDatabase(url + "/" + key, val, true).then(function(res) {
        resolve(key)
      }).catch(function(err) {
        reject(err)
      })
    })
  }
  getLimited(url, num,by) {
    return new Promise((resolve, reject)=>{
      this.stg.get('recentFiftiCache').then((snap)=>{
        if(snap){
          firebase.database().ref(url.substring(0,url.lastIndexOf("/"))+"/mCache").once("value",(snaperro)=>{
            if(snap!==snaperro.val()){
              firebase.database().ref(url).orderByChild(by).limitToLast(num).on("value",(snapshot)=>{
                // This callback will be triggered exactly two times, unless there are
                // fewer than two dinosaurs stored in the Database. It will also get fired
                // for every new, heavier dinosaur that gets added to the data set.
                console.log(snapshot.key);
                resolve(snapshot.val())
              },(err)=>{
                reject(err)
              });
            }else{
              this.stg.get('recentFifti').then((tin)=>{
                resolve(tin)
              })
            }
          }).catch((err)=>{
            console.log("no connection maybe?")
            this.stg.get('recentFifti').then((tin)=>{
              resolve(tin)
            })
          })
        }else{
          firebase.database().ref(url).orderByChild(by).limitToLast(num).on("value",(snapshot)=>{
            // This callback will be triggered exactly two times, unless there are
            // fewer than two dinosaurs stored in the Database. It will also get fired
            // for every new, heavier dinosaur that gets added to the data set.
            console.log(snapshot.key);
            resolve(snapshot.val())
          },(err)=>{
            reject(err)
          });
        }
      })


    })
  }
  rmDatabase(url) {
    return new Promise(function(resolve, reject) {
      firebase.database().ref(url).remove().then(function(res) {
        resolve(res)
      }).catch(function(err) {
        reject(err)
      })
    })
  }
  getDatabase(url, once, ctrl?:boolean) {

    return new Promise((resolve, reject)=>{
      this.stg.get(url+"/cache").then((c)=>{
        if(c){
        firebase.database().ref(url+"/cache").once('value').then((res)=>{
          console.log(res.val())
          console.log(c)
          if(res.val()){
            if(res.val()!==c){
              console.log("Jesus Lord save me",res.val(),c)
              if(ctrl){
                var load= this.lc.create({
                  content:"Getting new stuff..."
                })
                load.present()
              }

              console.log("How are you even here")
              firebase.database().ref(url).once('value').then((r)=>{
                console.log("This is res from fuckit",r.val())
                if(ctrl){load.dismiss()}

                var x=r.val()
                if(x){
                this.stg.set(url+"/cache",x.cache).then(()=>{
                  this.stg.get(url).then((res)=>{
                    var what=x||res

                    this.stg.set(url,what)
                  })

                })

                resolve(r.val())
              }else{
                resolve(null)
              }
              }).catch(function(err) {
                console.log(err)
                if(ctrl){load.dismiss()}
                reject(err)
              })
            }else{
              console.log("here????")
              this.stg.get(url).then((w)=>{
                console.log(w)
                if(!w){
                  console.log("Not w?")
                  firebase.database().ref(url).once('value').then((r)=>{
                    console.log("This is res from fuckit",r.val())


                    var x=r.val()
                    if(x){
                      this.stg.remove(url+"/cache")
                    this.stg.set(url+"/cache",x.cache).then(()=>{
                      this.stg.get(url).then((res)=>{
                        var what=x||res

                        this.stg.set(url,what)
                      })

                    })

                    resolve(r.val())
                  }else{
                    resolve(null)
                  }
                  }).catch(function(err) {
                    console.log(err)

                    reject(err)
                  })
                }else{
                  resolve(w)
                }
              }).catch((d)=>{
                reject("error")
              })
            }
          }else{
            this.stg.get(url).then((w)=>{
              console.log(w)
              if(!w){
                console.log("Not w?")
                firebase.database().ref(url).once('value').then((r)=>{
                  console.log("This is res from fuckit",r.val())


                  var x=r.val()
                  if(x){
                  //this.stg.remove(url+"/cache")
                  this.stg.set(url+"/cache",x.cache).then(()=>{
                    this.stg.get(url).then((res)=>{
                      var what=x||res

                      this.stg.set(url,what)
                    })

                  })

                  resolve(r.val())
                }else{
                  resolve(null)
                }
                }).catch(function(err) {
                  console.log(err)

                  reject(err)
                })
              }else{
                resolve(w)
              }
            }).catch((d)=>{
              reject("error")
            })
          }
        })
      }else{
        firebase.database().ref(url).once('value').then((r)=>{
          console.log("This is res from fuckit",r.val())
          //if(ctrl){load.dismiss()}

          var x=r.val()
          if(x){
          this.stg.set(url+"/cache",x.cache).then(()=>{
            this.stg.get(url).then((res)=>{
              var what=x||res

              this.stg.set(url,what)
            })

          })

          resolve(r.val())
        }else{
          resolve(null)
        }
        }).catch(function(err) {
          console.log(err)
          //if(ctrl){load.dismiss()}
          reject(err)
        })

      }
      })
    })
  }
  setDatabase(url, value, set) {
    return new Promise(function(resolve, reject) {
      if (set) {
        firebase.database().ref(url).set(value).then(function(res) {
          //console.log(res)
          resolve(res)
        }).catch(function(err) {
          console.log(err)
          reject(err)
        })
      } else {
        //var val = {}
        //val[url]=value
        firebase.database().ref().update(value).then(function(res) {
          console.log(res)
          resolve(res)
        }).catch(function(err) {
          console.log(err)
          reject(err)
        })
      }
    })
  }
  // getStorageUrl(url,){
  //   return new Promise(function(resolve,reject){
  //
  //   })
  // }
  getStorage(url) {
    return new Promise(function(resolve, reject) {
      var ref = firebase.storage().ref().child(url)
      ref.getDownloadURL().then(function(res) {
        console.log(res)
        var ress: any = res
        resolve(ress)
      }).catch(function(err) {
        console.log(err)
        reject(err)
      })
    })
  }
  setStorage(url, value,cam?) {
    var uploadTask
    if(cam){
      uploadTask = firebase.storage().ref().child(url).putString(value,'data_url')
    }else{
      uploadTask = firebase.storage().ref().child(url).put(value)
    }
    return uploadTask
  }
  currentUser() {
    return firebase.auth().currentUser
  }
  createUser(creds, pass?: any, veri?: any, ) {
    var number = creds.digits;
    var num = this.user.checkify(number);
    var email = this.user.emailify(num)
    var password = pass || this.user.passwordGen(number)

    var cr;
    console.log(email + "---" + password)
    return new Promise((resolve, reject)=>{
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(()=>{
      if (email === null) {
        reject("notEthiopian")
      }
      firebase.auth().createUserWithEmailAndPassword(email, password).then((d)=>{
        console.log("Account creation successful, proceeding with phone number verification,", d)
        var user = firebase.auth().currentUser
        this.stg.set("log",true).then(value => {
          this.stg.set("uzer",this.currentUser()).then(()=>{
            resolve(email)
          })

        })


      }).catch(function(err) {
        console.log("Account not created", err)
        reject(err)
      })
    }).catch((err)=>{
      reject(err)
      console.log("created account")
    })
  })

  }
  linkToNumber(number) {

    var user = firebase.auth().currentUser;
    var cr;
    var vm = this
    return new Promise(function(resolve, reject) {
      var ver = vm.nexmo.verify(number).then(() => {
        resolve(vm.nexmo)
      }).catch(() => {
        reject(vm.nexmo)
      })
    })
  }
  recaptcha(id) {
    //var recaptchaVerifier
    return new Promise(function(resolve, reject) {
      resolve(new firebase.auth.RecaptchaVerifier(id, {
        "size": "invisible",
        "callback": function(response) {
        },

      }))
    })
  }
  logout() {
    return new Promise(function(resolve, reject) {
      firebase.auth().signOut().then(function(sucl) {
        console.log("logged out")
        resolve(sucl)
      }).catch(function(er) {
        console.log("no logging out...you're stuck :)", er)
        reject(er)
      })
    })
  }
  login(e,p) {

    var email = e
    var password = p
    var vm = this
    return new Promise((resolve, reject)=>{
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(()=>{

          // Existing and future Auth states are now persisted in the current
          // session only. Closing the window would clear any existing state even
          // if a user forgets to sign out.
          // ...
          // New sign-in will be persisted with session persistence.
          if (password&&password!=="") {
            firebase.auth().signInWithEmailAndPassword(email, password).then((res) => {
              console.log("is this the prob?")
              resolve()

            }).catch((err) => {
              this.stg.set("log",false).then(value => {
                reject(err)
              }).catch((err)=>{
                reject(err)
              })

            })
          }else{
            reject("Password")
          }

        })
        .catch(function(error) {
          // Handle Errors .
          reject(error)
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
    })
  }

  /*uploadPhotoFromFile(_imageData, _progress) {


    return new Observable(observer => {
      var _time = new Date().getTime()
      var fileRef = firebase.storage().ref('images/sample-' + _time + '.jpg')
      var uploadTask = fileRef.put(_imageData['blob']);

      uploadTask.on('state_changed', function(snapshot) {
        console.log('state_changed', snapshot);
        _progress && _progress(snapshot)
      }, function(error) {
        console.log(JSON.stringify(error));
        observer.error(error)
      }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var downloadURL = uploadTask.snapshot.downloadURL;

        // Metadata now contains the metadata for file
        fileRef.getMetadata().then(function(_metadata) {

          // save a reference to the image for listing purposes
          var ref = firebase.database().ref('images');
          ref.push({
            'imageURL': downloadURL,
            'thumb': _imageData['thumb'],
            'owner': firebase.auth().currentUser.uid,
            'when': new Date().getTime(),
            //'meta': _metadata
          });
          observer.next(uploadTask)
        }).catch(function(error) {
          // Uh-oh, an error occurred!
          observer.error(error)
        });

      });
    });
  }*/

  /*getDataObs() {
      var ref = firebase.database().ref('images')
      var that = this

      return new Observable(observer => {
          ref.on('value',
              (snapshot) => {
                  var arr = []

                  snapshot.forEach(function (childSnapshot) {
                      var data = childSnapshot.val()
                      data['id'] = childSnapshot.key
                      arr.push(data);
                  });
                  observer.next(arr)
              },
              (error) => {
                  console.log("ERROR:", error)
                  observer.error(error)
              });
      });
  }*/
}
