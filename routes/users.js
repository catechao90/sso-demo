var express = require('express')
var router = express.Router()
var userLogin = require('../common/userLogin')

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.query.token) {
    userLogin.getUserId(req.query.token).then(function (result) {
      if (result) {
        res.json({
          msg: '',
          code: 'sso-200',
          data: {
            userId: result.id
          }
        })
      } else {
        res.json({
          msg: '没有对应userId',
          code: 'sso-500',
          data: {
            userId: ''
          }
        })
      }
    })
  } else {
    res.json({
      msg: '需要token入参',
      code: 'sso-500',
      data: {
        userId: ''
      }
    })
  }
})

module.exports = router
