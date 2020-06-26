var grpc = require('grpc')

var PROTO_PATH = './impl.proto'
var conf = require('../config/grpcConf')
// var place_list = require('./db')
var impl_proto = grpc.load(PROTO_PATH).helloworld

var client = new impl_proto.Greeter(conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

function getList() {
  // 在这里是调用的远程服务端的locate方法
  return new Promise((resolve, reject) => {
    client.greeter({
      name: 'lisi'
    }, function(err, response) {
      console.log(response)
      if (!err) {
        resolve(response)
      }
    })
  })
}

module.exports = {
  getList
}

