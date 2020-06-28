# 基于 TypeScript, GraphQL, GRPC 搭建简易博客
## 介绍
本项目利用 Node 的 express 来框架，使用 GraphQL 开发了博客系统常用的后端接口，利用 GRPC  实现了对数据库的操作，提供了 TypeScript 和 JavaScript 两个版本，比较适合刚开始学习 GraphQL 和 GRPC 的小伙伴作为练手的小项目。

**目录结构**

```
.
├── doc // Issue&UpdateLog
├── build // TS 文件编译结果
├── src // TS版本代码
│   ├── config 
	      ├── db.ts
  	    ├── grpcConf.ts
│   ├── controller
	      ├── blog.ts
  	    ├── user.ts
  	    ├── graphql.ts
│   ├── public
	      ├── index.html
│   ├── types
	      ├── index.ts
│   └── db
	      ├── mysql.ts
│   └── grpc
	      ├── server.ts
	      ├── client.ts
	      ├── blog.proto
│   ├── app.ts
├── src_JS // JS版本代码
├── example // GraphQL,GRPC单独的测试案例
├── README.md
├── package-lock.json
├── package.json
├── tsconfig.json
```

## 使用指南

1）将此仓库 clone 到本地。

```bash
git clone https://github.com/happyCoding1024/blog-grpc-graphql.git
```

2）进入项目，打开命令行安装依赖包。

```bash
npm install
```

3）配置 MySql，程序中用到的 MySql 配置如下。

```js
MYSQL_CONF = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  port: '3306',
  database: 'huisi'
};
```

在 huisi 数据库下新建 blogs 表，设置如下：

![blogs table](https://raw.githubusercontent.com/happyCoding1024/image-hosting/master/img/1593317152324.png)

新建 users 表，设置如下：

![users table](https://raw.githubusercontent.com/happyCoding1024/image-hosting/master/img/20200628120740.png)

4）运行

在命令行中运行 `npm run dev`，同时打开浏览器输入 `localhost:4000/graphql`。

出现类似于下图所示的界面表示启动成功。

![](https://raw.githubusercontent.com/happyCoding1024/image-hosting/master/img/20200628145055.png)

5）调试验证

本项目没有开发相应的前端部分，可以采用 GraphQL 自带的 GraphiQL 进行接口的调试验证。

关于本项目中实现的接口以及如何调试，可以参考 [调试验证接口说明](doc/调试验证接口说明.md)。

## 功能

这个小项目主要实现了下面这些功能的后端接口。

- 获取博客列表

- 获取博客详情
- 新建博客
- 更新博客
- 删除博客
- 登录
- 注册

## 技术栈

 Node + Express + TypeScript + GraphQL + GRPC + MySql

## UpdateLog & IssueLog

记录新增的功能，修正的 bug，解决问题的方法，TodoList，学习心得等

[UpdateIssueLog](doc/issue.md)

[调试验证接口说明](doc/调试验证接口说明.md)

[GraphQL学习笔记](doc/GraphQL学习笔记.md)

[GRPC学习笔记](doc/GRPC学习笔记.md)

## 联系作者

如果您发现此项目有任何问题，希望可以抽时间告诉作者，感谢您的贡献，非常感谢。

如果您感觉此项目还可以，欢迎 star 鼓励一下作者，非常感谢。

联系方式：

- 在 [github issues](https://github.com/happyCoding1024/blog-grpc-graphql/issues) 提交问题

- [博客园 codingOrange](https://www.cnblogs.com/zhangguicheng/)

- [b站直播前端学习，一起来学习吧(一天12小时以上)](https://space.bilibili.com/421338049)

