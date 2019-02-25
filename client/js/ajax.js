app.ajax = (() => {
  /**
   * Make a get request
   * @param  {string} url  endpoint URL
   * @param  {Object} data data to send with the request
   * @return {Promise}     Promise that resolves when the request complests
   */
  const get = (url, data) => {
    return new Promise((resolve, reject) => {
      let fullURL = url + "?" + Object.keys(data).map(key => { key + '=' + data[key] }).join('&');
      let xhr = new XMLHttpRequest();
      xhr.open("get", fullURL);
      xhr.addEventListener("load", () => {
        let response = { message: "" };
        if (xhr.responseText) {
          response = JSON.parse(xhr.responseText);
        }
        if (xhr.status === 200) {
          resolve(response);
        } else {
          reject(xhr);
        }
      });
      xhr.addEventListener("error", (err) => { reject(err) });
      xhr.send();
    });
  }

  /**
   * Make a post request
   * @param  {string} url  endpoint URL
   * @param  {Object} body JSON-encodeable body object
   * @return {Promise}     Promise that resolves when the request completes
   */
  const post = (url, body) => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open("post", url);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.addEventListener("load", () => {
        let response = { message: "" };
        if (xhr.responseText) {
          response = JSON.parse(xhr.responseText);
        }
        if (xhr.status === 201) {
          resolve(response);
        } else {
          reject(xhr);
        }
      });
      xhr.addEventListener("error", (err) => { reject(err) });
      xhr.send(JSON.stringify(body));
    });
  }

  return {
    get,
    post
  }
})();