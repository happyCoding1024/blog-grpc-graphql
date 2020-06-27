const grpc = require('grpc')
const PROTO_PATH = './blog.proto'
const conf = require('../config/grpcConf')
const blog_proto = grpc.load(PROTO_PATH).blog

const client = new blog_proto.Blog(conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

// 获取文章列表
function getList () {
  // 在这里是调用的远程服务端的locate方法
  return new Promise((resolve, reject) => {
    client.getListGrpc({
      name: 'lisi'
    }, function(err, response) {
      console.log(response)
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

function getDetail () {
  // 在这里是调用的远程服务端的locate方法
  return new Promise((resolve, reject) => {
    client.getDetailGrpc({
      id: 15
    }, function(err, response) {
      console.log(response)
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}


// getList()
getDetail()

// module.exports = {
//   getList
// }

