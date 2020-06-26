"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
var PROTO_PATH = './blog.proto';
const grpcConf_1 = require("../config/grpcConf");
var blog_proto = grpc.load(PROTO_PATH).blog;
const { exec } = require('../db/mysql');
console.log(grpcConf_1.default);
// Simple RPC
function greeter(call, callback) {
    const sql = `select * from blogs where author = '${call.request.name}';`;
    console.log(sql);
    exec(sql).then(result => {
        callback(null, JSON.stringify(result));
    });
}
var server = new grpc.Server();
server.addProtoService(blog_proto['Blog'].service, {
    greeter: greeter
});
server.bind(grpcConf_1.default.ip.server + ':' + grpcConf_1.default.port, grpc.ServerCredentials.createInsecure());
server.start();
