# I Cant Come Up With An Idea For My Startup
A little node / redis app that queries HackerNews for startup ideas by searching for keywords.

## Using
Start up a redis server on the default port, this is used for caching.

```
$ npm i
$ npm start
```

If you would like to edit search terms, for now you will have to change them in `./src/keyPhrases.json`.
