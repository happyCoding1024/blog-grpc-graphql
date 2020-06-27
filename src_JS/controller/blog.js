const { exec } = require('../db/mysql')

// ****** 实现 GRPC 方法 ******* //
// 获取文章列表
function getListGrpc (call, callback) {
  let author = call.request.name
  let sql_blog = `select * from blogs where 1=1 `
  if (author) {
    sql_blog += `and author = '${author}' `
  }
  sql_blog += 'order by createtime desc;'
  exec(sql_blog).then(result => {
    console.log(JSON.stringify(result))
    callback(null, JSON.stringify(result))  
  })
}

// 获取文章详情
function getDetailGrpc (call, callback) {
  const { id } = call.request
  let sql = `select * from blogs where 1=1 `
  if (id) {
    sql += `and id = ${id};`
  }
  exec(sql).then(result => {
    callback(null, JSON.stringify(result))
  })
}

// 新建博客
function newBlog (call, callback) {
  const { } = call.request
  
}

module.exports = {
  getListGrpc,
  getDetailGrpc
}