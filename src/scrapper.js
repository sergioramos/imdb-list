const ID_REXP = /^\/title\/tt(.*?)\//i;

var Readable = require('readable-stream').Readable;
var inherits = require('inherits');
var request = require('request');
var concat = require('concat-stream');
var isError = require('is-error');
var isString = require('is-string');
var cheerio = require('cheerio');
var defaults = require('defaults');
var once = require('once');
var pump = require('pump');
var url = require('url');


var Scrapper = module.exports = function(opts, href) {
  if (isString(opts)) return Scrapper({}, opts);
  if (!(this instanceof Scrapper)) return new Scrapper(opts, href);

  Readable.call(this, defaults({
    objectMode: true
  }, opts));

  this._holding = [];
  this._waiting = true;
  this._ended = false;

  this._load(href);
};

inherits(Scrapper, Readable);

Scrapper.prototype._onError = function(err) {
  this.emit('error', err);
};

Scrapper.prototype._list = function(href, $) {
  var self = this;

  var $next = $('.pages .pagination a:last-child');

  $('.list.compact tr[data-item-id]').map(function(i, tr) {
    var href = $(tr).find('.title a').attr('href');
    if (!href) return;
    var id = href.match(ID_REXP);
    if (id) self._holding.push(id[1]);
  });

  if (!($next.length && $next.text().match(/^Next/))) {
    self._ended = true;
    return;
  }

  self._load(url.format(defaults({
    search: $next.attr('href')
  }, url.parse(href))));
};

Scrapper.prototype._top = function(href, $) {
  var self = this;

  $('.lister-list .titleColumn a').map(function(i, anchor) {
    var id = $(anchor).attr('href').match(ID_REXP);
    if (id) self._holding.push(id[1]);
  });
};

Scrapper.prototype._parse = function(href, html) {
  var $ = cheerio.load(html);

  if (/top$/.test(href)) this._top(href, $);
  else this._list(href, $);

  this._read();
};

Scrapper.prototype._read = function() {
  if (!this._holding.length) {
    this._waiting = true;
    return;
  }

  this._waiting = false;

  if (this.push({
    id: this._holding.shift()
  })) {
    return this._read();
  }

  if (this._ended && !this._holding.length) {
    this.push(null);
  }
};

Scrapper.prototype._load = function(href) {
  var self = this;

  var hasHTML = once(function(html) {
    if (isError(html)) return self._onError(html);
    self._parse(href, html);
  });

  pump(request(href), concat(hasHTML), hasHTML);
};