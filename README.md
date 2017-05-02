This is an extension which helps debug PureCloud's realtime APIs. Intended for use in
development of PureCloud or PureCloud integrations.

Contributing, developing:
  - `npm install`
  - `npm test` - runs linter and builds extension

Install:
 - https://chrome.google.com/webstore/detail/cgcbglankfpindfcechphhmcnoljajkl

Install for localhost:
 - Clone repo and ensure localhost is listed in manifest, then install from
 chrome://extensions

 Use:
```javascript
debugRealtime(/jabber:client/, 'log', { absoluteTime: true, filterRealtime: /transport-info/ });
```

Handy Method for triggering ice failures:
```javascript
debugRealtime(/jabber:client/, 'log', { thawIce: true });
// now ice candidates sent over realtime will get mangled causing ice failures

// use refreeze to cause ice mangling to stop after a short period of time (i.e., simulate failure/retry)
debugRealtime(/jabber:client/, 'log', { thawIce: true, refreeze: 4000 });
```

```javascript
/// log jabber:client stanzas, filtering none, mangling ice transports
debugRealtime(/jabber:client/, 'log',
    {
      absoluteTime: true,
      filterRealtime: null,
      mangleStanzas: [{
        regexp: /ip=".*?"/,
        mangle: (s) => {
          return s.toString().replace(/ip=".*?"/g, 'ip="123.123.123.123"').replace(/rel-addr=".*?"/g, 'rel-addr="123.123.123.123"');
        }
      }, {
        regexp: /ufrag=".*?"/,
        mangle: (s) => {
          return s.toString().replace(/ufrag=".*?"/g, 'ufrag="123a"').replace(/pwd="/g, 'pwd="asd').replace(/:..<\/finger/g, ':00</finger');
        }
      }]
})
```
