import * as grpc from 'grpc'
const PROTO_PATH = './blog.proto'
import conf from '../config/grpcConf'
const blog_proto = grpc.load(PROTO_PATH).blog

const client = new blog_proto['Blog'](conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

function getList () {
  // 在这里是调用的远程服务端的locate方法
  return new Promise((resolve, reject) => {
    client.greeter({
      name: 'lisi'
    }, function(err, response) {
      console.log(JSON.parse(response.message))
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

getList()

// module.exports = {
//   getList
// }

