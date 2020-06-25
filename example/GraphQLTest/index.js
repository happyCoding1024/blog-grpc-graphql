var express = require('express')
var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

var schema = buildSchema(`
  type Account {
    name: String
    age: Int
    sex: String
    department: String
    salary(city: String): Int
  }
  type Query {
    getClassMetes(classNo: Int!): [String]
    account(username: String!): Account
  }
`)

var root = { 
  // 参数经常用解构的方式接收，因为在GraphQL中调用函数传参的形式是getClassMetes(classNo: 31) 
  getClassMetes({ classNo }) {
    // 应该是从数据库中取值
    const obj = {
      31: ['zhangsan', 'lisi'],
      61: ['wangwu', 'zhaoliu']
    }
    return obj[classNo]
  },
  account({ username }) {
    const salary = ({ city }) => {
      if (city === 'shenzhen') {
        return 10000
      }
      return 8000
    }
    return {
      name: username,
      age: 18,
      sex: 'man',
      department: '开发部',
      salary
    }
  } 
}

var app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

// 公开public文件夹，让用户可以访问里面的静态资源，例如index.html
app.use(express.static('public'))

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))