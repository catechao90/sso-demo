/**
 *
 * @authors cate
 * @date    2017-11-29 14:47:30
 * @version 1.0
 */

// 获取redis的IP
const options = process.argv

const redis = require('redis')
const client = redis.createClient('6379', options[2] === 'dev' ? '127.0.0.1' : '')
client.select(1)

var SSO_CONFIG = {
  secret: 'cateislovely',
  client: client,
  cookieDomain: '.example.com'
}

// 设置SSO_CONFIG为只读属性
Object.freeze(SSO_CONFIG)
module.exports = SSO_CONFIG