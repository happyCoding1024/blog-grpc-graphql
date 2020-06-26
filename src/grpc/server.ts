import * as  grpc from 'grpc'

var PROTO_PATH = './blog.proto'
import conf from '../config/grpcConf'
var blog_proto = grpc.load(PROTO_PATH).blog
const { exec } = require('../db/mysql')

console.log(conf)
// Simple RPC
function greeter(call, callback) {
  const sql = `select * from blogs where author = '${call.request.name}';`
  console.log(sql)
  exec(sql).then(result => {
    callback(null, JSON.stringify(result))  
  })
}

var server = new grpc.Server()
server.addProtoService(blog_proto['Blog'].service, {
  greeter: greeter
})
server.bind(conf.ip.server + ':' + conf.port, grpc.ServerCredentials.createInsecure())
server.start()