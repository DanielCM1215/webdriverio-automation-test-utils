export default class apiInterceptor {
    static async setupInterception() {
        await browser.execute(() => {
            window._apiResponses = [];
            sessionStorage.setItem('_apiResponses', JSON.stringify([]));

            // Intercept Fetch API
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const response = await originalFetch(...args);
                const clonedResponse = response.clone();

                clonedResponse.text().then(text => {
                    try {
                        const jsonData = JSON.parse(text);
                        console.log('[FETCH] Intercepted API response:', jsonData);

                        let responses = JSON.parse(sessionStorage.getItem('_apiResponses')) || [];
                        const newResponse = { url: args[0], data: jsonData };

                        // Avoid duplicate storage
                        const isDuplicate = responses.some(res =>
                            res.url === newResponse.url &&
                            JSON.stringify(res.data) === JSON.stringify(newResponse.data)
                        );

                        if (!isDuplicate) {
                            responses.push(newResponse);
                            sessionStorage.setItem('_apiResponses', JSON.stringify(responses));
                        }
                    } catch (e) {
                        console.warn('[FETCH] Non-JSON response intercepted:', text);
                    }
                });

                return response;
            };

            // Intercept XHR API
            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                this._url = url;
                return originalXHROpen.apply(this, [method, url, ...rest]);
            };

            const originalXHROnSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function (body) {
                this.addEventListener('load', function () {
                    try {
                        const responseText = this.responseText;
                        const jsonData = JSON.parse(responseText);
                        console.log(`[XHR] Intercepted API response from ${this._url}:`, jsonData);

                        let responses = JSON.parse(sessionStorage.getItem('_apiResponses')) || [];
                        const newResponse = { url: this._url, data: jsonData };

                        const isDuplicate = responses.some(res =>
                            res.url === newResponse.url &&
                            JSON.stringify(res.data) === JSON.stringify(newResponse.data)
                        );

                        if (!isDuplicate) {
                            responses.push(newResponse);
                            sessionStorage.setItem('_apiResponses', JSON.stringify(responses));
                        }
                    } catch (e) {
                        console.error('[XHR] JSON parsing error:', e);
                    }
                });

                return originalXHROnSend.apply(this, [body]);
            };
        });
    }

    static async getStoredResponses() {
        return await browser.execute(() =>
            JSON.parse(sessionStorage.getItem('_apiResponses')) || []
        );
    }

    static async waitForAPIResponse(targetEndpoint, timeout = 20000) {
        await browser.waitUntil(async () => {
            const responses = await this.getStoredResponses();
            return responses.some(res => res.url.includes(targetEndpoint));
        }, {
            timeout,
            timeoutMsg: `API response not received for ${targetEndpoint}`
        });

        const responses = await this.getStoredResponses();
        console.log('[WAIT] All API responses:', responses);

        const targetResponse = responses.find(res =>
            res.url.includes(targetEndpoint)
        );

        if (targetResponse) {
            console.log(`[WAIT] Matched response for ${targetEndpoint}:`, targetResponse.data);
            return targetResponse.data;
        } else {
            console.warn(`[WAIT] No response found for ${targetEndpoint}.`);
            return null;
        }
    }

    static async clearInterceptedResponses() {
        await browser.execute(() => {
            sessionStorage.setItem('_apiResponses', JSON.stringify([]));
            console.log('[CLEAR] Intercepted API responses cache cleared');
        });
    }
}
