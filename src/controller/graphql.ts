import { buildSchema } from 'graphql'
import { 
  getList,
  getDetail,
  createBlog,
  updateBlog,
  deleteBlog,
  userLogin,
  registerUser
 } from '../grpc/client'

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
  input LoginInput {
    username: String
    password: String
  }
  input RegisterInput {
    username: String
    password: String
  }
  type DbResult {
    status: Boolean
  }
  type Mutation {
    newBlog(input: BlogInput!): DbResult
    updateBlog(input: BlogUpdate): DbResult
    deleteBlog(input: BlogDelete): DbResult
    login(input: LoginInput): DbResult
    register(input: RegisterInput): DbResult
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
        resolve({
          status: insertData['status']
        })
      })
    })
  },

  // 更新博客
  updateBlog({ input }) {
    return new Promise((resolve, reject) => {
      updateBlog(input).then(updateData => {
        resolve({
          status: updateData['status']
        })
      })
    })
  },

  // 删除博客
  deleteBlog({input}) {
    return new Promise((resolve, reject) => {
      deleteBlog(input).then(deleteData => {
        resolve({
          status: deleteData['status']
        })
      })
    })
  },

  // 登录
  login({ input }) {
    return new Promise((resolve, reject) => {
      userLogin(input).then(loginData => {
        resolve({
          status: loginData['status']
        })
      })
    })
  },

  // 注册
  register({ input }) {
    return new Promise((resolve, reject) => {
      registerUser(input).then(registerData => {
          resolve({
            status: registerData['status']
          })
      })
    })
  }
}

export {
  schema,
  root
}