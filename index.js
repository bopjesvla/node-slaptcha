var http = require('http')
var https = require('https')
var qs = require('querystring')

var validate = module.exports.validate = function(private_key, slaptcha, opts, cb) {
  var slaptcha_id = slaptcha.slaptcha_id
  var slaptcha_a1 = slaptcha.slaptcha_a1
  var slaptcha_a2 = slaptcha.slaptcha_a2

  if (typeof opts == 'function') {
    cb = opts
    opts = void 0
  }

  var defaults = {
    protocol: 'https:',
    host: 'api.slaptcha.com',
    path: '/a',
    port: 80,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  var req = (opts.protocol == 'http:' ? http : https).request(Object.assign(defaults, opts), (res) => {
    str = ''
    res.setEncoding('utf8')
    res.on('data', c => str += c)
    res.on('error', cb)
    res.on('end', _ => {
      try {
        var r = JSON.parse(str)
        if (r.success == null) {
          return cb(Object.assign(new Error(r.error), r))
        }
      } catch (e) {
        cb(e)
      }
      cb(null, r.success)
    })
  })

  var data = qs.stringify({private_key, slaptcha_id, slaptcha_a1, slaptcha_a2})
  req.write(data)
  req.end()
}

module.exports.middleware = function(private_key, validationOpts, middlewareOpts) {
  return function(req, res, next) {
    if (middlewareOpts.bypass && middlewareOpts.bypass(req, res)) {
      return next()
    }
    validate(private_key, req.body, validationOpts, (err, success) => {
      req.human = success
      next(err)
    })
  }
}
