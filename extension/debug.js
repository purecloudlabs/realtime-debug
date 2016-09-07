'use-strict';

(() => {
  let filter = /.*/;
  let level = 'log';
  window.debugRealtime = (_filter, _level) => {
    if (_filter && typeof _filter.test === 'function') {
      filter = _filter;
    } else {
      console.warn('Failed to set debug filter - must be regexp or object with function `test`');
    }

    if (['error', 'warn', 'info', 'log', 'debug'].indexOf(_level) > -1) {
      level = _level;
    }
  };

  // formatDelta taken from https://github.com/latentflip/websocket-debug/blob/master/script.js
  // nicely format time delta (delta is in milliseconds)
  // 0->9:        "+Nms  "
  // 10->99:      "+NNms "
  // 100->999:    "+NNNms"
  // 1000->9999   "+N.NNs"
  // 10000->59999 "+NN.Ns"
  // 60000+       "+NNmNNs
  const formatDelta = (delta) => {
    const ONE_MINUTE = 60 * 1000;

    // pos/neg sign
    const s = delta >= 0 ? '+' : '-';

    // ms only
    if (delta < 10) { return `${s}${delta}ms  `; }
    if (delta < 100) { return `${s}${delta}ms `; }
    if (delta < 1000) { return `${s}${delta}ms`; }

    // secs
    if (delta < 10000) {
      const secs = delta / 1000;
      // 2 decimal places ideally, but toFixed rounds up
      return `${s}${secs.toFixed(2).substr(0, 4)}s`;
    }

    if (delta < ONE_MINUTE) {
      const secs = delta / 1000;

      return `${s}${secs.toFixed(1).substr(0, 4)}s`;
    }

    // mins + secs
    {
      const mins = Math.floor(delta / ONE_MINUTE);
      const secs = Math.floor((delta - (mins * ONE_MINUTE)) / 1000);
      return `${s}${mins}m${secs}s`;
    }
  };

  const prettyPrintXml = (xml) => {
    const parser = new window.DOMParser();
    return parser.parseFromString(xml, 'text/xml').firstChild;
  };

  const shouldLog = (stanza) => {
    if (!filter) {
      return false;
    }

    return filter.test(stanza);
  };

  let lastStanzaTime = null;

  const logStanza = (direction, stanza) => {
    if (!shouldLog(stanza)) {
      return;
    }
    const time = lastStanzaTime ? new Date().getTime() - lastStanzaTime : 0;
    const css = direction === '⬆' ? 'color:red' : 'color:green';

    if (['presence', 'iq', 'message'].indexOf(stanza.name) > -1 ||
          /<iq|<message|<presence/.test(stanza)) {
      const prettyStanza = prettyPrintXml(stanza.toString());
      console[level](`[realtime] %c${direction}`, css, formatDelta(time), prettyStanza);
    } else {
      console[level]('unknown stanza', stanza);
    }
    lastStanzaTime = new Date().getTime();
  };

  console.debug('content script loaded');
  const realtime = new Promise((resolve, reject) => {
    let count = 0;
    const findRealtime = () => {
      if (count > 30) {
        console.debug('failed to load realtime');
        return reject();
      }
      if (window.Realtime && window.Realtime._instances) {
        const instances = window.Realtime._instances();
        if (instances.length && instances[0].socket) {
          return resolve(instances[0]);
        }
      }
      count++;
      setTimeout(findRealtime, 500);
    };

    findRealtime();
  });

  realtime.then((instance) => {
    console.debug('got rt instance', instance);
    instance.socket.on('stanza', (stanza) => {
      logStanza('⬇', stanza);
    });

    const send = instance._server.send.bind(instance._server);
    instance._server.send = function (stanza) {
      logStanza('⬆', stanza);
      send(...arguments);
    };
  });
})();
