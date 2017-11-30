var express = require('express')
var router = express.Router()
var cookieParser = require('cookie-parser')
var userLogin = require('../common/userLogin')
var SSO_CONFIG = require('../common/config')

router.use(cookieParser())

router.get('/', function (req, res, next) {
  if (req.cookies.renliwo_id) {
    userLogin.ifLogin(req.cookies.renliwo_id).then(function (data) {
      if (data) {
        res.render('index', { err: false, message: '已登录' })
      } else {
        res.render('index', { err: true, message: '没有登录' })
      }
    })
  } else {
    res.render('index', { err: true, message: '' })
  }
})

router.post('/', function (req, res, next) {
  if (req.body.username.trim() !== '' && req.body.password.trim() !== '') {
    userLogin.login(req.body.username, req.body.password).then(function (result) {
      if (result) {
        res.cookie('renliwo_id', result, { maxAge: 3600 * 1000, domain: SSO_CONFIG.cookieDomain })
        res.json({
          msg: 'ok!'
        })
      }
    })
  } else {
    res.json({
      msg: '用户名或者密码不正确'
    })
  }
})

module.exports = router
