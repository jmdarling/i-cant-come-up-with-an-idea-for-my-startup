const redis = require('redis')

const config = require('./config')
const HackerNewsService = require('./hackerNewsService')
const keyPhrases = require('./keyPhrases.json')

// Bootstrap.
const redisClient = redis.createClient(config.redisUrl)
const hackerNewsService = new HackerNewsService(config, redisClient)

// Main.
hackerNewsService.getTopStoriesIds()
  .then(topStoriesIds => {
    topStoriesIds.forEach(topStoryId => {
      hackerNewsService.getStory(topStoryId)
        .then(topStory => {
          if (topStory.kids == null) {
            return
          }

          topStory.kids.forEach(commentId => {
            hackerNewsService.getComment(commentId)
              .then(recurseComment)
              .catch(console.error)
          })
        })
        .catch(console.error)
    })
  })
  .catch(console.error)

/**
 * Recurses a comment's children.
 *
 * @param {Comment} comment  The comment whose children should be recursed.
 * @param {number} [depth=0] The current recursion depth.
 */
function recurseComment (comment, depth = 0) {
  if (depth > config.commentRecustionDepth) {
    return
  }

  if (comment == null) {
    return
  }

  if (comment.text != null) {
    const matchingKeyPhrases = getMatchingKeyPhrases(comment.text, keyPhrases)

    if (matchingKeyPhrases.length > 0) {
      console.log(`Found match for key phrase(s): ${matchingKeyPhrases.join(', ')} at recursion depth ${depth}\n${comment.text}\n\n`)
    }
  }

  if (comment.kids != null) {
    comment.kids.forEach(commentId => {
      hackerNewsService.getComment(commentId)
        .then(comment => {
          recurseComment(comment, depth + 1)
        })
        .catch(console.error)
    })
  }
}

/**
 * Gets the key phrases that match the provided text.
 *
 * @param {string} text       The text to search for key phrases.
 * @param {Array}  keyPhrases Array of key phrases to search for in the provided text.
 *
 * @returns {Array} The array of key phrases that are found in the provided text.
 */
function getMatchingKeyPhrases (text, keyPhrases) {
  if (text == null) {
    return []
  }

  return keyPhrases.reduce((matchingKeyPhrases, keyPhrase) => {
    if (text.toLowerCase().includes(keyPhrase.toLowerCase())) {
      return matchingKeyPhrases.concat(keyPhrase)
    }
    return matchingKeyPhrases
  }, [])
}

process.on('exit', () => {
  redisClient.quit()
})
