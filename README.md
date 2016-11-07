This is an extension which helps debug PureCloud's realtime APIs. Intended for use in
development of PureCloud or PureCloud integrations.

Contributing, developing:
  - `npm install`
  - `npm test` - runs linter and builds extension

Install:
 - https://chrome.google.com/webstore/detail/cgcbglankfpindfcechphhmcnoljajkl

Use on localhost:
 - Clone repo and ensure localhost is listed in manifest, then install from
 chrome://extensions

Extension based on [getScreenMedia](https://github.com/HenrikJoreteg/getScreenMedia)


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
          return s.toString().replace(/ufrag=".*?"/g, 'ufrag="123a"').replace(/pwd="/g, 'pwd="asd').replace(/:..<\/finger/g, '00:</finger');
        }
      }]
})
```
