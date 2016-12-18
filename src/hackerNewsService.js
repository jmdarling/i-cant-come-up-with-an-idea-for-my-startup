const request = require('request')

module.exports = class HackerNewsService {
  constructor (config, redisClient) {
    this._config = config
    this._redisClient = redisClient
  }

  /**
   * Gets the comment specified by the provided ID.
   *
   * @param {string} commentId
   *
   * @returns {Promise}
   */
  getComment (commentId) {
    return this._getFromUrl(`${this._config.hackerNewsBaseUrl}/item/${commentId}.json`, true, 60 * 60 * 24)
  }

  /**
   * Gets the story specified by the provided ID.
   *
   * @param {string} storyId
   *
   * @returns {Promise}
   */
  getStory (storyId) {
    return this._getFromUrl(`${this._config.hackerNewsBaseUrl}/item/${storyId}.json`, true, 60 * 5)
  }

  /**
   * Gets the IDs of the top stories.
   *
   * @returns {Promise}
   */
  getTopStoriesIds () {
    return this._getFromUrl(`${this._config.hackerNewsBaseUrl}/topstories.json`, true, 60)
  }

  /**
   * Gets data from the requested URL, from cache if possible, otherwise via an HTTP GET.
   *
   * @param {string} url                  The URL to get data from.
   * @param {boolean} [isCacheable=false] True if the result is cachable, false otherwise.
   * @param {number} [cacheTtlSeconds=60] How long to cache responses for.
   *
   * @returns {any}
   */
  _getFromUrl (url, isCacheable = false, cacheTtlSeconds = 60) {
    return new Promise((resolve, reject) => {
      this._redisGetFromUrl(url)
        .then(resolve)
        .catch(() => {
          this._httpGetFromUrl(url)
            .then(response => {
              if (isCacheable) {
                this._redisClient.set(url, JSON.stringify(response), 'EX', cacheTtlSeconds)
              }

              resolve(response)
            })
            .catch(error => {
              reject(error)
            })
        })
    })
  }

  /**
   * Attempts to retrieve the cached results of an HTTP request to the given URL from Redis and JSON parses the result.
   *
   * @param {string} url
   *
   * @returns {any}
   */
  _redisGetFromUrl (url) {
    return new Promise((resolve, reject) => {
      this._redisClient.get(url, (error, response) => {
        if (error != null) {
          console.error(error)
          return reject(error)
        }

        if (response == null) {
          return reject(new Error('Not found'))
        }

        try {
          return resolve(JSON.parse(response))
        } catch (error) {
          console.error(error)
          return reject(error)
        }
      })
    })
  }

  /**
   * Performs an HTTP GET to the specified URL and JSON parses the response.
   *
   * @param {string} url
   *
   * @returns {any}
   */
  _httpGetFromUrl (url) {
    return new Promise((resolve, reject) => {
      request.get(url, (error, response, body) => {
        if (error != null) {
          return reject(error)
        }

        if (body == null) {
          return reject(new Error('Not found'))
        }

        try {
          return resolve(JSON.parse(body))
        } catch (error) {
          return reject(error)
        }
      })
    })
  }
}
