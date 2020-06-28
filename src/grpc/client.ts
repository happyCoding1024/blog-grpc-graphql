import * as grpc from 'grpc'
import conf from '../config/grpcConf'

const PROTO_PATH = './grpc/blog.proto'
const blog_proto = grpc.load(PROTO_PATH).blog
const client = new blog_proto['Blog'](conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())
// 获取文章列表
function getList(author) {
  // 在这里是调用的远程服务端的getListGrpc方法
  return new Promise((resolve, reject) => {
    client.getListGrpc({
      name: author
    }, function(err, response) {
      console.log(JSON.parse(response.message))
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}
// 获取文章详情
function getDetail (id) {
  // 在这里是调用的远程服务端的getDetailGrpc方法
  return new Promise((resolve, reject) => {
    client.getDetailGrpc({
      id: id
    }, function(err, response) {
      console.log(JSON.parse(response.message))
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

// 新建博客
function createBlog (input) {
  return new Promise((resolve, reject) => {
    client.newBlogGrpc({
      title: input.title,
      content: input.content
    }, function (err, response) {
      console.log(response)
      if(!err) {
        resolve(JSON.parse(response.message))
      } else {
        reject(err)
      }
    })
  })
}

// 更新博客
function updateBlog (input) {
  return new Promise((resolve, reject) => {
    console.log('input = ', input)
    client.updateBlogGrpc({
      id: parseInt(input.id),
      title: input.title,
      content: input.content
    }, function (err, response) {
      if (!err) {
        resolve(JSON.parse(response.message))
      } else {
        reject(err)
      }
    })
  })
}

// 删除博客
function deleteBlog (input) {
  return new Promise((resolve, reject) => {
    client.deleteBlogGrpc({
      id: parseInt(input.id)
    }, function (err, response) {
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

// 登录
function userLogin (input) {
  return new Promise((resolve, reject) => {
    client.loginGrpc({
      username: input.username,
      password: input.password
    }, function (err, response) {
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

// 注册
function registerUser (input) {
  return new Promise((resolve, reject) => {
    client.registerGrpc({
      username: input.username,
      password: input.password
    }, function (err, response) {
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

export {
  getList,
  getDetail,
  createBlog,
  updateBlog,
  deleteBlog,
  userLogin,
  registerUser 
}
