self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (url.origin === location.origin) {
        event.respondWith(
            self.cookieStore.getAll()
                .then(cookies => {
                    let drillSeleniumSessionId = null;
                    let drillSeleniumTestId = null;
                    for (let cookie of cookies) {
                        if (cookie.name === 'drill-selenium-session-id') {
                            drillSeleniumSessionId = cookie.value;
                        }
                        if (cookie.name === 'drill-selenium-test-id') {
                            drillSeleniumTestId = cookie.value;
                        }
                    }

                    if (drillSeleniumSessionId && drillSeleniumTestId) {
                        let newHeaders = new Headers(event.request.headers);
                        newHeaders.append('drill-selenium-session-id', drillSeleniumSessionId);
                        newHeaders.append('drill-selenium-test-id', drillSeleniumTestId);

                        let newReq = new Request(event.request.url, {
                            method: event.request.method,
                            headers: newHeaders,
                            mode: 'cors',
                            credentials: event.request.credentials,
                            cache: event.request.cache,
                            redirect: event.request.redirect,
                            referrer: event.request.referrer,
                            body: event.request.body
                        });
                        return fetch(newReq);
                    } else {
                        return fetch(event.request);
                    }
                })
                .catch(error => {
                    console.error('Error in fetch event listener:', error);
                    return fetch(event.request);
                })
        );
    }
});
