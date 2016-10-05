var slaptcha = require('.')
var assert = require('assert')

slaptcha.validate('bad_key', {}, err => assert(err instanceof Error))
