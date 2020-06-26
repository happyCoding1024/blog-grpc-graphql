import * as express from 'express'
import * as  graphqlHTTP from 'express-graphql'
import  { buildSchema } from 'graphql'
import * as grpc from 'grpc'
import conf from './config/grpcConf'

const PROTO_PATH = './grpc/blog.proto'
const blog_proto = grpc.load(PROTO_PATH).blog
const client = new blog_proto['Blog'](conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

// 获取文章列表
function getList (author: String) {
  // 在这里是调用的远程服务端的locate方法
  return new Promise((resolve, reject) => {
    client.greeter({
      name: author
    }, function(err, response) {
      console.log(JSON.parse(response.message))
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

const app = express()
// 定义 schema
const schema = buildSchema(`
  type Blog {
    id: ID
    title: String
    content: String
    createtime: String
    author: String
    abstract: String
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

const root = { 
  // 参数经常用解构的方式接收，因为在GraphQL中调用函数传参的形式是getArticleList(author: 'zhangsan)
  // 获取文章列表
  getArticleList({ author }) {
    // 从数据库中取值
    return new Promise((resolve, reject) => {
      // 调用GRPC方法
      getList(author).then(articleList => {
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
