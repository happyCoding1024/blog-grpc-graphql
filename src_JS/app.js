const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
// const { getList } = require('./grpc/client')

var grpc = require('grpc')

var PROTO_PATH = './grpc/impl.proto'
var conf = require('./config/grpcConf')
// var place_list = require('./db')
var impl_proto = grpc.load(PROTO_PATH).helloworld

var client = new impl_proto.Greeter(conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

function getList() {
  // 在这里是调用的远程服务端的locate方法
  return new Promise((resolve, reject) => {
    client.greeter({
      name: 'lisi'
    }, function(err, response) {
      console.log(JSON.parse(response.message))
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

var app = express()

  // 定义 schema
  var schema = buildSchema(`
    type Blog {
      id: ID
      title: String
      content: String
      createTime: String
      author: String
    }
    type User {
      id: ID
      username: String
      password: String
    }
    type Query {
      getArticleList(author: String): [Blog]
    }
  `)

  var root = { 
    // 参数经常用解构的方式接收，因为在GraphQL中调用函数传参的形式是getArticleList(author: 'zhangsan)
    // 获取文章列表
    getArticleList({ author }) {
      // 从数据库中取值
      return new Promise((resolve, reject) => {
        // 调用GRPC方法
        getList().then(articleList => {
          console.log(articleList)
          resolve(articleList)
        })
      })
    }
  }

  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  }))

  // 公开public文件夹，让用户可以访问里面的静态资源，例如index.html
  app.use(express.static('public'))

  app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))

