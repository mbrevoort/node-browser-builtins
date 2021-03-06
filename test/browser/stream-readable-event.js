// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var test = require('tape');
var timers = require('timers');
var Buffer = require('buffer').Buffer;

var Readable = require('stream').Readable;

test('stream.Readable - readable event - first', function (t) {
  // First test, not reading when the readable is added.
  // make sure that on('readable', ...) triggers a readable event.
  var r = new Readable({
    highWaterMark: 3
  });

  var _readCalled = false;
  r._read = function(n) {
    _readCalled = true;
  };

  // This triggers a 'readable' event, which is lost.
  r.push(new Buffer('blerg'));

  var caughtReadable = false;
  timers.setImmediate(function() {
    // we're testing what we think we are
    t.ok(!r._readableState.reading);
    r.on('readable', function() {
      caughtReadable = true;
      done();
    });
  });

  function done() {
    // we're testing what we think we are
    t.ok(!_readCalled);

    t.ok(caughtReadable);
    t.end();
  }
});

test('stream.Readable - readable event - second', function (t) {
  // second test, make sure that readable is re-emitted if there's
  // already a length, while it IS reading.

  var r = new Readable({
    highWaterMark: 3
  });

  var _readCalled = false;
  r._read = function(n) {
    _readCalled = true;
    if (_readCalled && caughtReadable) t.end();
  };

  // This triggers a 'readable' event, which is lost.
  r.push(new Buffer('bl'));

  var caughtReadable = false;
  timers.setImmediate(function() {
    // assert we're testing what we think we are
    t.ok(r._readableState.reading);
    r.on('readable', function() {
      caughtReadable = true;
      if (_readCalled && caughtReadable) t.end();
    });
  });
});

test('stream.Readable - readable event - third', function (t) {
  // Third test, not reading when the stream has not passed
  // the highWaterMark but *has* reached EOF.
  var r = new Readable({
    highWaterMark: 30
  });

  var _readCalled = false;
  r._read = function(n) {
    _readCalled = true;
  };

  // This triggers a 'readable' event, which is lost.
  r.push(new Buffer('blerg'));
  r.push(null);

  var caughtReadable = false;
  timers.setImmediate(function() {
    // assert we're testing what we think we are
    t.ok(!r._readableState.reading);
    r.on('readable', function() {
      caughtReadable = true;
      done();
    });
  });

  function done() {
    // we're testing what we think we are
    t.ok(!_readCalled);

    t.ok(caughtReadable);
    t.end();
  }
});
