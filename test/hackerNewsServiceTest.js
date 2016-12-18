/* eslint-env mocha */
const assert = require('assert')
const redis = require('redis')

const config = require('../src/config')
const HackerNewsService = require('../src/hackerNewsService')

const redisClient = redis.createClient(config.redisUrl)
const hackerNewsService = new HackerNewsService(config, redisClient)

describe('hackerNewsService', () => {
  after(() => {
    redisClient.quit()
  })

  describe('#getComment', () => {
    it('returns a comment when a valid comment ID is provided', () => {
      // Arrange.
      const commentId = 2921983

      // Act.
      // Assert.
      return hackerNewsService.getComment(commentId)
        .then(comment => {
          assert.notStrictEqual(comment, null)
        })
    })
    it('returns null when an invalid comment ID is provided', () => {
      // Arrange.
      const commentId = 'xX_SPOOKY_INVALID_ID_Xx'

      // Act.
      // Assert.
      return hackerNewsService.getComment(commentId)
        .then(comment => {
          assert.strictEqual(comment, null)
        })
    })
  })

  describe('#getStory', () => {
    it('returns a story when a valid story ID is provided', () => {
      // Arrange.
      const storyId = 8863

      // Act.
      // Assert.
      return hackerNewsService.getStory(storyId)
        .then(story => {
          assert.notStrictEqual(story, null)
        })
    })
    it('returns null when an invalid story ID is provided', () => {
      // Arrange.
      const storyId = 'xX_SPOOKY_INVALID_ID_Xx'

      // Act.
      // Assert.
      return hackerNewsService.getStory(storyId)
        .then(story => {
          assert.strictEqual(story, null)
        })
    })
  })

  describe('#getTopStoriesIds', () => {
    it('returns at least one story id', () => {
      // Arrange.
      // Act.
      // Assert.
      return hackerNewsService.getTopStoriesIds()
        .then(topStories => {
          assert.strictEqual(Array.isArray(topStories), true)
          assert.strictEqual(topStories.length >= 1, true)
        })
    })
  })
})
