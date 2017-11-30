var SSO_CONFIG = require('../common/config')
const md5 = require('crypto-js/md5')
const prefix = 'Cate' // 缓存键名前缀

/**
 * 生成一个token
 * @param  {[type]} uid 用户id
 * @return {[type]}     [description]
 */
function getUserToken (uid) {
  const baseStr = uid + Date.now() + SSO_CONFIG.secret
  return md5(baseStr).toString()
}

/**
 * 设置token至redis
 * @param {any} uid
 * @returns
 */
function setCache (uid) {
  const token = getUserToken(uid)
  const cacheNmae = prefix + '-User-' + token
  const cacheVal = JSON.stringify({id: uid})
  return new Promise(function (resolve, reject) {
    SSO_CONFIG.client.set(cacheNmae, cacheVal, function (err, response) {
      if (!err) {
        resolve(token)
      } else {
        resolve(null)
      }
    })
  })
}

/**
 * 读取用户登录存在缓存中的信息
 * @return {[type]} [description]
 */
function getCache (token) {
  const cacheNmae = prefix + '-User-' + token
  return new Promise(function (resolve, reject) {
    SSO_CONFIG.client.get(cacheNmae, function (err, response) {
      if (!err) {
        try {
          const data = JSON.parse(response)
          resolve(data)
        } catch (err) {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}

/**
 * 去重token
 * @return {[type]} [description]
 */
function unicCache (userId) {
  return new Promise(function (resolve, reject) {
    SSO_CONFIG.client.keys('*', function (err, keys) {
      if (err) return reject(err)
      if (keys.length > 0) {
        getCacheArray(keys, userId).then(function (results) {
          if (results.length > 0) {
            SSO_CONFIG.client.del(results, function (err, o) {
              if (err) reject(err)
              resolve(true)
            })
          } else {
            resolve(true)
          }
        })
      } else {
        resolve(true)
      }
    })
  })
}

/**
 * 查找所有userId相同的token
 * @param {any} keys
 * @param {any} userId
 * @returns
 */
function getCacheArray (keys, userId) {
  var delKeys = []
  return new Promise(function (resolve, reject) {
    keys.forEach((element, index) => {
      return (function () {
        SSO_CONFIG.client.get(element, function (err, response) {
          if (!err) {
            const data = JSON.parse(response)
            if (data.id === userId) {
              delKeys.push(element)
            }
          } else {
            console.log(err)
          }
          if (index === keys.length - 1) {
            resolve(delKeys)
          }
        })
      })(element)
    })
  })
}

/**
 * 查找token
 * @return {[type]} [description]
 */
function searchCache (token) {
  const cacheNmae = prefix + '-User-' + token
  return new Promise(function (resolve, reject) {
    SSO_CONFIG.client.get(cacheNmae, function (err, response) {
      if (!err) {
        resolve(response)
      } else {
        console.log(err)
        resolve(null)
      }
    })
  })
}

/**
 * 用户登录
 * @param  {[type]} uid      [description]
 * @return {[type]}          [description]
 */
async function login (uid, password) {
  let action = await unicCache(uid)
  if (action === true) {
    let isc = await setCache(uid)
    return isc
  } else {
    console.log(action)
    return null
  }
}

/**
 * 退出登录
 * @return {[type]} [description]
 */
function logOut (token) {
  getCache(token)
}

/**
 * 查询userId
 * @return {[type]} [description]
 */
async function getUserId (token) {
  let userId = await getCache(token)
  return userId
}

/**
 * 查询是否登录
 * @return {[type]} [description]
 */
async function ifLogin (token) {
  let userId = await searchCache(token)
  return userId
}

module.exports = {login, logOut, getUserId, ifLogin}
