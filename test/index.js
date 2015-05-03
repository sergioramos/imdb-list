var JSON = require('jsonstream2');
var list = require('../');
var pump = require('pump')


pump(list({
  user: '23892615',
  lists: [
    'ratings',
    'watchlist',
    'checkins',
    'top',
    '051230526'
  ]
}), JSON.stringify(), process.stdout, function(err) {
  if (err) throw err;
  process.exit(0);
});