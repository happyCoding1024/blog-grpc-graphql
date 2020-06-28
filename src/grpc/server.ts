import * as grpc from 'grpc'
import conf from '../config/grpcConf'
import { getListGrpc, getDetailGrpc, newBlogGrpc, updateBlogGrpc, deleteBlogGrpc } from '../controller/blog'
import { loginGrpc, registerGrpc } from '../controller/user'

const PROTO_PATH = './blog.proto'
const blog_proto = grpc.load(PROTO_PATH).blog
const server = new grpc.Server()
server.addProtoService(blog_proto['Blog'].service, {
  getListGrpc,
  getDetailGrpc,
  newBlogGrpc,
  updateBlogGrpc,
  deleteBlogGrpc,
  loginGrpc,
  registerGrpc
})
server.bind(conf.ip.server + ':' + conf.port, grpc.ServerCredentials.createInsecure())
server.start()