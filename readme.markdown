# level-cowdown

copy-on-write leveldown

# example

We can make a lazy copy of the `src` database as the `copy` db:

``` js
var cow = require('level-cowdown');
var levelup = require('levelup');
var memdb = require('memdb');

var src = memdb({ valueEncoding: 'json' });
src.batch([
    { type: 'put', key: 'a', value: 100 },
    { type: 'put', key: 'b', value: 555 },
    { type: 'put', key: 'c', value: 300 },
], ready);

function ready () {
    var copy = levelup('fake', {
        db: function () { return cow(src, memdb()) },
        valueEncoding: 'json'
    });
    copy.get('a', function (err, value) {
        console.log('a:copy=', value);
    });
    copy.put('b', 5000, function (err) {
        src.get('b', function (err, value) {
            console.log('b:src=', value);
        });
        copy.get('b', function (err, value) {
            console.log('b:copy=', value);
        });
    });
}
```

output:

```
b:src= 555
a:copy= 100
b:copy= 5000
```

# api

``` js
var cow = require('level-cowdown')
```

## var copy = cow(originaldb, newdb)

Lazily make a copy of `originaldb`, storing data in `newdb`.

Returns a leveldown `copy`.

Note that if you modify `originaldb`, you will see those modifications in
`newdb` unless `newdb` has operations on the same key.

# install

With [npm](https://npmjs.com) do:

```
npm install level-cowdown
```

# license

MIT
