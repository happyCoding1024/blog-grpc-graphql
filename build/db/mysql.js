"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = void 0;
// 引用 mysql
const mysql = require("mysql");
// 引用配置文件
const db_1 = require("../config/db");
// 创建连接对象
const con = mysql.createConnection(db_1.MYSQL_CONF);
// 开始连接
con.connect();
// 统一执行 sql 的函数
function exec(sql) {
    const promise = new Promise((resolve, reject) => {
        con.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
    return promise;
}
exports.exec = exec;
