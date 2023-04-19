import {onCLS, onFID, onLCP} from 'web-vitals';

const queue = new Set();
function addToQueue(metric) {
  queue.add(metric);
}

function flushQueue() {
  if (queue.size > 0) {
    // Replace with whatever serialization method you prefer.
    // Note: JSON.stringify will likely include more data than you need.
    const body = JSON.stringify([...queue]);

    // Use non-blocking APIs like `navigator.sendBeacon()` if available,
    // falling back to `fetch()`.
    (navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
      fetch('/analytics', {body, method: 'POST', keepalive: true});

    queue.clear();
  }
}

onCLS(addToQueue);
onFID(addToQueue);
onLCP(addToQueue);

// Report all available metrics whenever the page is backgrounded or unloaded.
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    flushQueue();
  }
});

// NOTE: Safari does not reliably fire the `visibilitychange` event when the
// page is being unloaded. If Safari support is needed, you should also flush
// the queue in the `pagehide` event.
addEventListener('pagehide', flushQueue);
