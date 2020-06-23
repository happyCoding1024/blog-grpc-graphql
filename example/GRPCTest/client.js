var grpc = require('grpc')

var PROTO_PATH = './impl.proto'
var conf = require('./conf')
// var place_list = require('./db')
var impl_proto = grpc.load(PROTO_PATH).helloworld

var client = new impl_proto.Greeter(conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

function callback() {
    console.log('end')
}

function main() {
    // 在这里是调用的远程服务端的locate方法
    client.greeter({
      name: 'zhangsan'
    }, function(err, response) {
        console.log(124)
        console.log(response)
    })
}

main()

