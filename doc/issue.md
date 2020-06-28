# issue

> 记录一下在做项目的过程中遇到的问题和一些学习心得
## 1. GraphQL 中存在异步请求

在需要使用 GRPC 获取获取数据库中的数据时在 root 方法中的实际上是一个异步操作，这个时候不能直接 return，而是应该 return 一个 promise。举例说明，获取文章列表 getArticleList，

```js
getArticleList({ author }) {
  // 从数据库中取值
  return new Promise((resolve, reject) => {
    getList(author).then(articleList => {
      resolve(articleList)
    })
  })
}
```
由于这里 getList 中存在异步请求，因此 getArticleList 中不能使用 `return articleList`，因为在执行 getList 中的代码的时候，实际上已经执行完了 `return undefined`，所以 getArticleList 永远会返回 undefined。

这个时候可以使用 promise，在最后 `resolve(articleList)` 和同步代码时的 `return` 可以达到同样的效果。

> 由于 JS 是单线程，所以异步请求会很常见，时刻要记住异步编程和同步编程的区别。

## 2. 将 grpc 中的 client 从 app.js 中拆分出去后，会报错.

为了使单个文件的体积小，模块化，将 grpc 中的 client 单独从 app.js 中拆分出去，但是会报 `counld not load file "./blog.proto"`，单独在 grpc 中测试时路径是没有问题的。

![load .pr0to fail](https://raw.githubusercontent.com/happyCoding1024/image-hosting/master/img/20200626100454.png)

**解决**

这是因为忘记使用 Node 中的 path 模块了，直接使用的是相对路径的形式，改为下面这样就好了。

```js
import * as path from 'path'
const PROTO_PATH = path.resolve(__dirname, 'blog.proto')
```

## 3. getList 返回结果中 createTime 都返回 null

数据库中设置的变量名是 createtime，并不是 createTime，将程序中改为 createtime 后发现还是有问题，这是因为在数据库中 createtime 的类型是 BigInt 而且数值超出了 GraphQL 中 Int 的表示范围，可以将数据库和程序中 createtime 的类型都改为 String 类型。

### 4. 在 schema 中，注意类型主要分为两种，在新建博客需要插入的内容的类型的时候要前面要使用 input，其它的前面一般用 type。

```js
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
```

### 5. 在 GraphQL 中传递的参数都是字符串的形式，如果需要的是 number 类型，需要通过 parseInt 转换一下

例如在更新博客的时候，需要传入需要更新的博客的 id，我在 GraphiQL 中是这样书写的：

```c
mutation {
	updateBlog(input: {
    id: 21
    title: "title B"
    content: "更新博客"
  }){
    insertId
  }
}
```

在 app.js 中接收的时候，input 的值如下

```js
{
  id: "21",
  title: "title B",
  content: "更新博客"
}
```

可以看到 id 的值变成了字符串类型，所以在向数据库那边传递的时候需要用 parseInt 进行一下转换。

```js
client.updateBlogGrpc({
  id: parseInt(input.id), // 需要转换为 number 类型
  title: input.title,
  content: input.content
}
```

