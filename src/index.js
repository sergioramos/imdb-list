var bloom = require('bloomfilter-filter');
var combine = require('stream-combiner2');
var merge = require('merge-stream');
var minstache = require('minstache');
var pathnames = require('./pathnames');
var defaults = require('defaults');
var isString = require('is-string');
var flatten = require('flatten');
var filter = require('through2-filter');
var url = require('url');
var scrape = require('./scrapper');

const PROTOCOL = 'http:';
const HOSTNAME = 'www.imdb.com';
const RATINGS = minstache.compile(pathnames.ratings);
const WATCHLIST = minstache.compile(pathnames.watchlist);
const CHECKINS = minstache.compile(pathnames.checkins);
const LIST = minstache.compile(pathnames.list);
const TOP = minstache.compile(pathnames.top);


var href = function(pathname) {
  return decodeURIComponent(url.format({
    protocol: PROTOCOL,
    hostname: HOSTNAME,
    pathname: pathname
  }));
};

var list = function(id) {
  return scrape(href(LIST({
    list: id
  })));
};

list.ratings = function(user) {
  return scrape(href(RATINGS({
    user: user
  })));
};

list.watchlist = function(user) {
  return scrape(href(WATCHLIST({
    user: user
  })));
};

list.checkins = function(user) {
  return scrape(href(CHECKINS({
    user: user
  })));
};

list.top = function() {
  return scrape(href(TOP()));
};

module.exports = function(options) {
  var opts = defaults(options, {
    user: '',
    lists: []
  });

  var _items = merge.apply(null, flatten(opts.lists.map(function(id) {
    return (list[id] ? list[id](opts.user) : list(id));
  })));

  var _exists = filter.obj(function(entry) {
    return (isString(entry.id) && entry.id.length);
  });

  var _duplicates = bloom.obj(function(entry) {
    return entry.id;
  });

  return combine.obj(_items, _exists, _duplicates);
};