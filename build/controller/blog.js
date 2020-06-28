"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogGrpc = exports.updateBlogGrpc = exports.newBlogGrpc = exports.getDetailGrpc = exports.getListGrpc = void 0;
const mysql_1 = require("../db/mysql");
// ****** 实现 GRPC 方法 ******* //
// 获取文章列表
function getListGrpc(call, callback) {
    let author = call.request.name;
    let sql_blog = `select * from blogs where 1=1 `;
    if (author) {
        sql_blog += `and author = '${author}' `;
    }
    sql_blog += 'order by createtime desc;';
    mysql_1.exec(sql_blog).then(result => {
        console.log(JSON.stringify(result));
        callback(null, JSON.stringify(result));
    });
}
exports.getListGrpc = getListGrpc;
// 获取文章详情
function getDetailGrpc(call, callback) {
    const { id } = call.request;
    let sql = `select * from blogs where 1=1 `;
    if (id) {
        sql += `and id = ${id};`;
    }
    mysql_1.exec(sql).then(result => {
        callback(null, JSON.stringify(result));
    });
}
exports.getDetailGrpc = getDetailGrpc;
// 新建博客
function newBlogGrpc(call, callback) {
    const { title, content } = call.request;
    // TODO: 需要改为登录时的作者
    let author = 'zhangsan';
    let abstract = content;
    let sql = `insert into blogs (title, content, createtime, author, abstract) values ('${title}', '${content}', '${Date.now()}', '${author}', '${abstract}')`;
    console.log('sql = ', sql);
    mysql_1.exec(sql).then(result => {
        if (result['affectedRows'] > 0) {
            callback(null, JSON.stringify({
                status: true
            }));
        }
        else {
            callback(null, JSON.stringify({
                status: false
            }));
        }
    });
}
exports.newBlogGrpc = newBlogGrpc;
// 更新博客
function updateBlogGrpc(call, callback) {
    console.log('call.request = ', call.request);
    const { id, title, content } = call.request;
    let sql = `update blogs set title='${title}', content='${content}' where id=${id};`;
    console.log(sql);
    mysql_1.exec(sql).then(result => {
        if (result['affectedRows'] > 0) {
            callback(null, JSON.stringify({
                status: true
            }));
        }
        else {
            callback(null, JSON.stringify({
                status: false
            }));
        }
    });
}
exports.updateBlogGrpc = updateBlogGrpc;
// 删除博客
function deleteBlogGrpc(call, callback) {
    const { id } = call.request;
    // TODO: 需要使用登录后的用户名
    // 加 author 的作用就是设置权限，只有当前的用户才能删除自己的文章
    const author = 'zhangsan';
    let sql = `delete from blogs where id ='${id}' and author = '${author}';`;
    mysql_1.exec(sql).then(result => {
        if (result['affectedRows'] > 0) {
            callback(null, JSON.stringify({
                status: true
            }));
        }
        else {
            callback(null, JSON.stringify({
                status: false
            }));
        }
    });
}
exports.deleteBlogGrpc = deleteBlogGrpc;
