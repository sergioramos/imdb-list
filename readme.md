# imdb-list

## install

```bash
npm install [--save/--save-dev] imdb-list
```

## api

```javascript
var JSON = require('jsonstream2');
var list = require('imdb-list');


list({
  user: '23892615',
  lists: [
    'ratings',
    'watchlist',
    'checkins',
    'top',
    '051230526'
  ]
})
.pipe(JSON.stringify())
.pipe(process.stdout)
```

## license

MIT