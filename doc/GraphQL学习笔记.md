# GraphQL 学习笔记

> 参考：
>
> [GraphQL 官网](https://graphql.cn/)
>
> [为什么说 GraphQL 可以取代 REST API](https://www.cnblogs.com/zhangguicheng/articles/13204007.html)
>
> [GraphQL 从入门到实战](https://www.cnblogs.com/zhangguicheng/articles/13204028.html)
>
> [GraphQL入门到精通视频](https://www.bilibili.com/video/BV1Ab411H7Yv?from=search&seid=13283931650985524263)

## 1. GraphQL 介绍

GraphQL 是由 Facebook 开发的一种数据查询语言，并于 2015 年公开发布，它是 restful 的替代品。

**特点**

1）只请求需要的数据，不多不少

例如需要请求用户名和用户的年龄，那么就只会请求到这两个，其它的像用户的性别就不会请求。

2）获取多个资源，只用一个请求

之前使用 restful 的时候，请求某个资源就要发送一次请求，但是使用 GraphQL 获取多个资源时只需要一次请求。

3）描述所有可能类型的系统，便于维护，

GraphQL 是一种描述性的查询语言，它可以将所有的资源都描述成某种类型，使用的时候可以按照第一个特点中讲的只取得我们需要的字段就好了。它非常便于维护，例如现在 account 资源（类型）中有多了一个 level 的字段，那么我们只需要添加上这个字段即可对其它的代码没有什么影响，同理删除一个字段也非常简单。

## 2. GraphQL 和 restful 的对比

restful（Representational State Transfer) 表属性状态转移。本质上就是利用 URI，通过 API 接口获取资源。

restful 一个接口只能返回一个资源，graphql 一次可以获取多个资源。

restful 用不同的 URI 来区分资源，graphql 用不同的类型区分资源。

## 3. 使用 express + GraphQL

这个就是官网上的示例，代码如下:

```js
var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    hello: String,
    accountName: String
  }
`);

var root = { 
  hello: () => 'Hello world!' ,
  accountName: () => 'zhangsan'
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
```

## 4. 参数类型和参数传递

数据类型分类：

1）基本类型：String，Int，Float，Boolean 和 ID。可以在 schema 中声明的时候直接使用。

> 注意 ID 本质上是字符串类型，但是注意不能重复，如果有重复的就会报错

2）数组，[类型] 表示某种类型的数组，例如 [Int] 表示整型的数组

和 JS 传递参数一样，小括号内定义形参，但是注意：参数需要定义类型。

在参数的类型后面加一个 `!` 表示该参数不能为空。下面代码中第二个参数的类型后面没有 `!` 因此不传也可以。

```js
type Query {
  roolDice(numDice: Int!, numSides: Int): [Int]
}
```

示例：

```js
var express = require('express')
var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

var schema = buildSchema(`
  type Query {
    getClassMetes(classNo: Int!): [String]
  }
`)

var root = { 
  // 参数经常用结构的方式接收，因为在GraphQL中调用函数传参的形式是getClassMetes(classNo: 31) 
  getClassMetes({ classNo }) {
    // 应该是从数据库中取值
    const obj = {
      31: ['zhangsan', 'lisi'],
      61: ['wangwu', 'zhaoliu']
    }
    return obj[classNo]
  }
}

var app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))
```

GraphQL 允许用户自定义参数类型，通常用来描述要获取的资源的属性。

例如，如果某个方法返回的类型很复杂，那么就可以使用自定义参数类型。

在下面的代码中，account 的返回值是一个比较复杂的类型，因此我们可以自定义一个类型来表示它的返回值类型。并且注意参数中 slary 又是一个函数，因此可以再次请求某个信息，这也就体现了 GraphQL 可以一次获取多个资源，如果使用 restful 来做，在这里必须发送两次请求才可以获取到 account 和 salary，这也体现了 GraphQL 的优势。

```js
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
  // 参数经常用结构的方式接收，因为在GraphQL中调用函数传参的形式是getClassMetes(classNo: 31) 
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

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))
```

## 5. GraphQL Client

如何在客户端访问 GraphQL 接口？

首先在服务端需要公开 public 文件夹供用户访问里面的静态资源，实际上这里就是让用户可以访问里面的 index.html 文件。

```js
// 公开public文件夹，让用户可以访问里面的静态资源，例如index.html
app.use(express.static('public'))
```

然后在 public 文件夹下新建 index.html 文件.

> 注意 query 的书写格式，现在还不是完全懂

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <button onclick="handleBtnClick()">获取数据</button>
  <script>
    function handleBtnClick () {
      const query = `
        query Account($username: String!, $city: String) {
          account(username: $username) {
            name
            age
            sex
            salary(city: $city)
          }
        }
      `
      const variables = {
        username: 'zhangsan',
        city: 'shenzhen'
      }
      fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          variables,
          query
        })
      }).then(res => {
        console.log(res)
      })
    }
  </script>
</body>
</html>
```

执行 `node demo.js` 启动服务器即可。

## 6. 使用 Mutation 修改数据

> 1）在更新和添加数据的时候参数是 input 类型而不是 type 类型。
>
> 2）必须包含 Query 这个 type，否则在调试截面中将不会显示内容。

在 GraphiQL 调试界面中的代码

> 引号必须用双引号

```js
// 查询
query {
  getAccounts {
    name
    age
    sex
  }
}
// 创建新的用户
mutation {
  createAccount(input: {
  	name: "zhangsan",
    age: 18,
    sex: "man"
  })
}
```

后端完整代码(mutation.js)

```js
const express = require('express')
const { buildSchema } = require('graphql')
const graphqlHTTP = require('express-graphql')

const schema = buildSchema(`
  input AccountInput {
    name: String
    age: Int
    sex: String
  }
  type Account {
    name: String
    age: Int
    sex: String
  }
  type Mutation {
    createAccount(input: AccountInput!): Account
    updateAccount(id: ID, input: AccountInput): Account
  }
  type Query {
    getAccounts: Account
  }
`)

// 用一个对象模拟数据库
let db = {}

// 实现 schema 中定义的方法
const root = {
  getAccounts () {
    // 如果直接返回db这个对象就会报错，GraphQL是不是只能返回数组
    let arr = []
    for (let key in db) {
        arr.push(db[key])
    }
    return arr
  },
  createAccount ({ input }) {
    db[input.name] = input
    return db[input.name]
  },
  updateAccount ({ id, input }) {
    // 如果直接让db[id] = input,那么那些没有被修改的属性也没有了
    const updatedAccount = Object.assign({}, db[id], input)
    db[id] = updatedAccount
    return updatedAccount
  }
}

const app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

// 公开public文件夹，让用户可以访问里面的静态资源，例如index.html
app.use(express.static('public'))

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))
```

## 7. 认证与中间件

数据对于一个公司来说是宝贵的财富，对于一些接口只有有权限的人才能进行访问。GraphQL 需要借助 express 的中间件来实现这个功能。

这里假设如果 cookie 中没有 auth 这个字段那么我们就认为他没有权限去访问。

```js
const app = express()

// 定义一个中间件
const middleware = (req, res, next) => {
  if (req.url.indexOf('/graphql') !== -1 && req.headers.cookie.indexOf('auth') === -1) {
    res.send(JSON.stringify({
      errno: '您没有权限访问'
    }))
    return
  }
  next()
}

// 在 express 中使用这个中间件
app.use(middleware)
```

## 8. Constructing Types

之前那样创建 schema，参数是一个字符串，这样当出现问题时变得不好定位，可以采用 Constructing Types 的方式来书写 schema，大体过程如下：

![](https://raw.githubusercontent.com/happyCoding1024/image-hosting/master/img/20200621202643.png)

![](https://raw.githubusercontent.com/happyCoding1024/image-hosting/master/img/20200621202936.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200621203532876.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQzMTk5MzE4,size_16,color_FFFFFF,t_70)

代码更改后

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200621204121230.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQzMTk5MzE4,size_16,color_FFFFFF,t_70)

## 9. 重点知识点捕获

**1）**采用GraphQL，甚至不需要有任何的接口文档，在定义了Schema之后，服务端实现Schema，客户端可以查看Schema，然后构建出自己需要的查询请求来获得自己需要的数据。

 GraphQL就是通过Schema来明确数据的能力，服务端提供统一的唯一的API入口，然后客户端来告诉服务端我要的具体数据结构（基本可以说不需要有API文档），有点客户端驱动服务端的意思。虽然客户端灵活了，但是GraphQL服务端的实现比较复杂和痛苦的，GraphQL 不能替代其它几种设计风格，并不是传说中的REST 2.0。 

> 出自:  https://zhuanlan.zhihu.com/p/56955812 

**2）在实际开发中我已经能体会到的 GraphQL 的优势**

> 1）例如现在前端需要某一篇文章的内容，如果采用 RESTFul 的形式那么需要在 url 中传递那篇文章的 id 参数，然后后端再根据这个 id 找到对应的文章，将其内容返回。如果采用 GraphQL 的形式，那么只需要前端书写需要获取某一篇文章的内容，后端就不需要做这个逻辑了。
>
> 2）可以将多个请求合并为一个请求。
>
> 例如，我们假设有三种资源：用户、订阅和简历。工程师需要按顺序进行两次单独的调用（这会降低性能）来获取一个用户简历，首先需要通过调用获取用户资源，拿到简历 ID，然后再使用简历 ID 来获取简历数据。对于订阅来说也是一样的。
>
> 1.GET /users/123：响应中包含了简历 ID 和工作岗位通知订阅的 ID 清单；
> 2.GET /resumes/ABC：响应中包含了简历文本——依赖第一个请求；
> 3.GET /subscriptions/XYZ：响应中包含了工作岗位通知的内容和地址——依赖第一个请求。
>
> 上面的示例很糟糕，原因有很多：客户端可能会获得太多数据，并且必须等待相关的请求完成了以后才能继续。此外，客户端需要实现如何获取子资源（例如建立或订阅）和过滤。（因为使用 REST 请求过来的数据包含没有用的，所以需要去过滤，当然这个过滤并不是说将一些信息去掉而是将利用其中的一些有用的信息）
>
> 想象一下，一个客户端可能只需要第一个订阅的内容和地址以及简历中的当前职位，另一个客户端可能需要所有订阅和整个简历列表。所以，如果使用 REST API，对第一个客户端来说有点不划算。
>
> 3）请求回来的数据会比较小，使用 GraphQL 请求回来的数据都是刚好需要的，因为请求什么数据是由前端写的。
>
> 4）使用 GraphQL 后只需要一个接口就好了，例如 `/graphql`，而之前使用 Rest 时需要前后端定义很多接口。
>
> 5） 使用 GraphQL 的另一个好处是提高了安全性，这是因为 URL 经常会被记录下来，而 RESTful GET 端点依赖于查询字符串（是 URL 的一部分）。这可能会暴露敏感数据，所以 RESTful GET 请求的安全性低于 GraphQL 的 POST 请求。 
>
> 6） GraphQL 提供了比 JSON RESTful API 更强的安全性，主要有两个原因：强类型 schema（例如数据验证和无 SQL 注入）以及精确定义客户端所需数据的能力（不会无意泄漏数据）。 

**3）**关于使用的传输的数据格式，RESTful API 采用的是 JSON，而 GraphQL 采用的 protobuf 定义，这是一种非常高效的序列化数据协议。

> Indeed（一个公司） 的大量对象和类型都是使用 ProtoBuf 定义的。类型化数据并不是什么新鲜事物，而且类型数据的好处也是众所周知。与发明新的 JSON 类型标准相比，GraphQL 的优点在于已经存在可以从 ProtoBuf 自动换换到 GraphQL 的库。即使其中一个库（[ rejoiner ](https://github.com/google/rejoiner)）不能用，也可以开发自己的转换器。
>
> GraphQL 提供了比 JSON RESTful API 更强的安全性，主要有两个原因：强类型 schema（例如数据验证和无 SQL 注入）以及精确定义客户端所需数据的能力（不会无意泄漏数据）。
>
> 静态验证是另一个优势，可以帮助工程师节省时间，并在进行重构时提升工程师的信心。诸如[ eslint-plugin-graphql ](https://github.com/apollographql/eslint-plugin-graphql)之类的工具可以让工程师知道后端发生的变化，并让后端工程师确保不会破坏客户端代码。
>
> 保持前端和后端之间的契约是非常重要的。在使用 REST API 时，我们要小心不要破坏了客户端代码，因为客户端无法控制响应消息。相反，GraphQL 为客户端提供了控制，GraphQL 可以频繁更新，而不会因为引入了新类型造成重大变更。因为使用了 schema，所以 GraphQL 是一种无版本的 API。

**4）GraphQL 问题**

> 1）缓存，直接使用 GrqphQL 是没有办法实现缓存的。 虽然构建 GraphQL 请求很容易，但是还需要实现很多其他东西，比如缓存，因为缓存可以极大地改善用户体验。构建客户端缓存不是那么容易，所幸的是，Apollo 和 Relay Modern 等提供了开箱即用的客户端缓存 

**5）什么时候不应该使用 GraphQL**

> 1. 使用的 API 很少也很简单
> 2. 产品开发不活跃不需要频繁改动 API

当然，完美的解决方案是不存在的（尽管 GraphQL 接近完美），还有一些问题需要注意，例如：

\1. 它有单点故障吗？

\2. 它可以扩展吗？

\3. 谁在使用 GraphQL？

最后，以下列出了我们自己的有关 GraphQL 可能不是一个好选择的主要原因：

- 当客户端的需求很简单时：如果你的 API 很简单，例如 /users/resumes/123，那么 GraphQL 就显得有点重了；
- 为了加快加载速度使用了异步资源加载；
- 在开发新产品时使用新的 API，而不是基于已有的 API；
- 不打算向公众公开 API；
- 不需要更改 UI 和其他客户端；
- 产品开发不活跃；
- 使用了其他一些 JSON schema 或序列化格式。

**6）**每个 GraphQL 服务必须有 Query 的 type，否则在 GraphiQL 调试界面的最右边就没有任何内容，例如在 Mutation.js 文件中必须也要有一个 Query 的 type。