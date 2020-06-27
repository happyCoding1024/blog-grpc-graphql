const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const grpc = require('grpc')
const PROTO_PATH = './grpc/blog.proto'
const conf = require('./config/grpcConf')
const { resolveFieldValueOrError } = require('graphql/execution/execute')

const blog_proto = grpc.load(PROTO_PATH).blog
const client = new blog_proto.Blog(conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

// 获取文章列表
function getList(author) {
  // 在这里是调用的远程服务端的getListGrpc方法
  return new Promise((resolve, reject) => {
    client.getListGrpc({
      name: author
    }, function(err, response) {
      console.log(JSON.parse(response.message))
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}
// 获取文章详情
function getDetail (id) {
  // 在这里是调用的远程服务端的getDetailGrpc方法
  return new Promise((resolve, reject) => {
    client.getDetailGrpc({
      id: id
    }, function(err, response) {
      console.log(JSON.parse(response.message))
      if (!err) {
        resolve(JSON.parse(response.message))
      }
    })
  })
}

// 新建博客
function createBlog (input) {
  return new Promise((resolve, reject) => {
    client.newBlogGrpc({
      title: input.title,
      content: input.content
    }, function (err, response) {
      console.log(response)
      if(!err) {
        resolve(JSON.parse(response.message))
      } else {
        reject(err)
      }
    })
  })
}

// 更新博客
function updateBlog (input) {
  return new Promise((resolve, reject) => {
    console.log('input = ', input)
    client.updateBlogGrpc({
      id: parseInt(input.id),
      title: input.title,
      content: input.content
    }, function (err, response) {
      if (!err) {
        resolve(JSON.parse(response.message))
      } else {
        reject(err)
      }
    })
  })
}

// 删除博客
function deleteBlog (input) {
  return new Promise((resolve, reject) => {
    client.deleteBlogGrpc({
      id: parseInt(input.id)
    }, function (err, response) {
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
  }
  input BlogInput {
    title: String
    content: String
  }
  input BlogUpdate {
    id: ID
    title: String
    content: String
  }
  input BlogDelete {
    id: ID
  }
  type InsertResult {
    insertId: Int
  }
  type UpdateResult {
    insertId: Int
  }
  type DeleteResult {
    insertId: Int
  }
  type User {
    id: ID
    username: String
    password: String
  }
  type Mutation {
    newBlog(input: BlogInput!): InsertResult
    updateBlog(input: BlogUpdate): UpdateResult
    deleteBlog(input: BlogDelete): DeleteResult
  }
  type Query {
    getArticleList(author: String): [Blog]
    getArticleDetail(id: Int): [Blog]
  }  
`)

const root = { 
  // 参数经常用解构的方式接收，因为在GraphQL中调用函数传参的形式是getArticleList(author: 'zhangsan)
  // 获取文章列表
  getArticleList({ author }) {
    // 从数据库中取值
    return new Promise((resolve, reject) => {
      getList(author).then(articleList => {
        console.log(articleList)
        resolve(articleList)
      })
    })
  },

  // 获取文章列表
  getArticleDetail({ id }) {
    // 从数据库中取值
    return new Promise((resolve, reject) => {
      // 调用GRPC方法
      getDetail(id).then(articleList => {
        console.log(articleList)
        resolve(articleList)
      })
    })
  },

  // 新建博客
  newBlog({ input }) {
    return new Promise((resolve, reject) => {
      // insertData 是往数据库中插入数据后的返回结果，形式是 {"fieldCount":0,"affectedRows":1,"insertId":21,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
      // 很明显不能直接将它 resolve
      createBlog(input).then(insertData => {
        console.log('insertData = ', insertData)
        resolve(insertData)
      })
    })
  },

  // 更新博客
  updateBlog({ input }) {
    return new Promise((resolve, reject) => {
      updateBlog(input).then(updateData => {
        resolve(updateData)
      })
    })
  },

  // 删除博客
  deleteBlog({input}) {
    return new Promise((resolve, reject) => {
      deleteBlog(input).then(deleteData => {
        resolve(deleteData)
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
