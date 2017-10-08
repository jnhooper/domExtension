const Rx = require('rxjs');

const intervalObservable = Rx.Observable.timer(0, 100);

const nowObservable = Rx.Observable.of(250);
const laterObservable = Rx.Observable.timer(300);

const windowsObservable = intervalObservable.window(nowObservable.concat(laterObservable));
const ourWindowObservable = windowsObservable.elementAt(1).concatAll();

ourWindowObservable.subscribe(console.log);
