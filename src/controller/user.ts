import { exec } from '../db/mysql'

// 登录
function loginGrpc (call, callback) {
  const { username, password } = call.request
  const sql = `select username, \`password\` from users where username='${username}' and password='${password}';`;
  exec(sql).then(result => {
    if (result[0]) {
      callback(null, JSON.stringify({
        status: true
      }))
    } else{
      callback(null, JSON.stringify({
        status: false
      }))
    }
  })
}

function registerGrpc (call, callback) {
  const { username, password } = call.request
  const sql = `insert into users (username, \`password\`) values ('${username}', '${password}');`
  // 在注册之前需要查询一下注册的用户名是否已经有了
  const sql_check = `select * from users where username = '${username}'`
  exec(sql_check).then(sameName => {
    console.log('sameName = ', sameName)
    if (!sameName[0]) {
      // 如果不存在重名就将用户名存到数据库中
      exec(sql).then(result => {
        callback(null, JSON.stringify({
          status: true
        }))
      })
    } else {
      // 如果用户名重名那么就不执行exec，而且让status为false
      callback(null, JSON.stringify({
        status: false
      }))
    }
  })
}

export {
  loginGrpc,
  registerGrpc
}