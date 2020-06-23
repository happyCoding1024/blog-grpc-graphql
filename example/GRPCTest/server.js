var grpc = require('grpc')

var PROTO_PATH = './impl.proto'
var conf = require('./conf')
// var place_list = require('./db')
var impl_proto = grpc.load(PROTO_PATH).helloworld

// Simple RPC
function greeter(call, callback) {
  console.log(call)
  callback(null, call.request.name)
}

var server = new grpc.Server()
server.addProtoService(impl_proto.Greeter.service, {
  greeter: greeter
})
server.bind(conf.ip.server + ':' + conf.port, grpc.ServerCredentials.createInsecure())
server.start()