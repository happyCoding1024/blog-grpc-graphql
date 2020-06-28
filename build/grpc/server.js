"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
const grpcConf_1 = require("../config/grpcConf");
const blog_1 = require("../controller/blog");
const user_1 = require("../controller/user");
const path = require("path");
const PROTO_PATH = path.resolve(__dirname, 'blog.proto');
const blog_proto = grpc.load(PROTO_PATH).blog;
const server = new grpc.Server();
server.addProtoService(blog_proto['Blog'].service, {
    getListGrpc: blog_1.getListGrpc,
    getDetailGrpc: blog_1.getDetailGrpc,
    newBlogGrpc: blog_1.newBlogGrpc,
    updateBlogGrpc: blog_1.updateBlogGrpc,
    deleteBlogGrpc: blog_1.deleteBlogGrpc,
    loginGrpc: user_1.loginGrpc,
    registerGrpc: user_1.registerGrpc
});
server.bind(grpcConf_1.default.ip.server + ':' + grpcConf_1.default.port, grpc.ServerCredentials.createInsecure());
server.start();
