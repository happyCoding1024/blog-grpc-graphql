var grpc = require('grpc')
var PROTO_PATH = './blog.proto'
var conf = require('../config/grpcConf')
var blog_proto = grpc.load(PROTO_PATH).blog
const { getListGrpc, getDetailGrpc, newBlogGrpc, updateBlogGrpc, deleteBlogGrpc } = require('../controller/blog')

var server = new grpc.Server()
server.addProtoService(blog_proto.Blog.service, {
  getListGrpc,
  getDetailGrpc,
  newBlogGrpc,
  updateBlogGrpc,
  deleteBlogGrpc
})
server.bind(conf.ip.server + ':' + conf.port, grpc.ServerCredentials.createInsecure())
server.start()