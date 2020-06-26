# issue
> 记录一下遇到的问题和一些学习心得
## 1. GrphQL
1）在需要使用 GRPC 获取获取数据库中的数据时在 root 方法中的实际上是一个异步操作，这个时候不能直接 return，而是应该 return 一个 promise.
```js

```
## 2. GRPC

### 1. `.proto` 文件解析

```c
syntax = "proto3";

option java_package = "io.grpc.examples";

package helloworld;

// The greeter service definition.
// 定义服务的名称
service Greeter {
  // Sends a greeting
  rpc greeter (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
// 定义了rpc函数的返回值的格式，例如在client中这样调用 callback(null, JSON,stringify({name: 'zhangsan'}))
// 那么 client.greeter 中第二个参数回调函数中的接收到服务端的返回值是 {message: '{name: "zhangsan"}'}
message HelloReply {
  string message = 1;
}
```

- 定义 rpc 函数，包含形参和返回值的形式。
```c
rpc greeter (HelloRequest) returns (HelloReply) {}
```
在 client.js 中，通过 client.方法名 远程调用服务端上实现的这个方法，按照上面形参的形式传递一个形参，第二个参数是一个回调，用于接收从服务端执行完方法后的返回结果。

```c
// 在这里是调用的远程服务端的方法
client.greeter({
  name: 'zhangsan'
}, function(err, response) {
  console.log(response)
})
```

返回结果的形式是上面 rpc 中定义的，例如在 server.js 中这样定义的这个方法：

```js
function greeter(call, callback) {
  callback(null, JSON.stringify({
    name: 'zhangsan'
  }))
}
```

那么在客户端的回调中收到的结果应该是：

```js
{
  message: "{ name: 'zhangsan'}"
}
```

- message
message 用来定义参数或返回值的格式

还是以上面 greeter 函数为例

定义的形参的格式是

```js
message HelloRequest {
  string name = 1;
}
```

所以在传递形参的时候要传递成下面的格式：

```js
{
  name: 'zhangsan'
}
```

> 注意在服务端使用 name 的值时需要这样使用
> ```js
>  function greeter (call, callback) {
>    const name = call.request.name
>    ...
>  }
> ``` 

定义的返回值的格式是：

```js
message HelloReply {
  string message = 1;
}
```

所以返回值的格式都是：

```js
{
  message: '服务端通过参数传递回来的值'
}
```

所以在 client.greeter 的第二个参数的回调中的 response 中 response.message 才是服务端传递过来的数据，并且类型是 String，需要通过 `JSON.parse(response.message)` 将其转换。

## 遇到的问题

### 1. 将 grpc 中的 client 从 app.js 中拆分出去后，会报错.

// TODO: 

为了使单个文件的体积小，模块化，将 grpc 中的 client 单独从 app.js 中拆分出去，但是会报 `counld not load file "./blog.proto"`，单独在 grpc 中测试时路径是没有问题的。

![load .pr0to fail](https://raw.githubusercontent.com/happyCoding1024/image-hosting/master/img/20200626100454.png)

## 2. getList 返回结果中 createTime 都返回 null

数据库中设置的变量名是 createtime，并不是 createTime，将程序中改为 createtime 后发现还是有问题，这是因为在数据库中 createtime 的类型是 BigInt 而且数值超出了 GraphQL 中 Int 的表示范围，可以将数据库和程序中 createtime 的类型都改为 String 类型。



