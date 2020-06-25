var grpc = require('grpc')

var PROTO_PATH = './impl.proto'
var conf = require('../config/grpcConf')
var impl_proto = grpc.load(PROTO_PATH).helloworld
const { exec } = require('../db/mysql')

// Simple RPC
function greeter(call, callback) {
  const sql = `select * from blogs where author = 'zhangsan';`
  console.log(sql)
  exec(sql).then(result => {
    console.log(result)
    callback(null, JSON.stringify(result))  
  })
}

var server = new grpc.Server()
server.addProtoService(impl_proto.Greeter.service, {
  greeter: greeter
})
server.bind(conf.ip.server + ':' + conf.port, grpc.ServerCredentials.createInsecure())
server.start()