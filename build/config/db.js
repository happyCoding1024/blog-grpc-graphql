"use strict";
// 获取环境变量,process是node中进程的一些信息
// const env = process.env.NODE_ENV; // 环境参数
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_CONF = exports.MYSQL_CONF = void 0;
// 配置
let MYSQL_CONF = null;
exports.MYSQL_CONF = MYSQL_CONF;
let REDIS_CONF = null;
exports.REDIS_CONF = REDIS_CONF;
// TODO: 临时赋予一个dev，因为还没有配置script脚本
const env = 'dev';
// 如果是开发环境
if (env === 'dev') {
    // mysql
    exports.MYSQL_CONF = MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'huisi'
    };
    // redis
    exports.REDIS_CONF = REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    };
}
