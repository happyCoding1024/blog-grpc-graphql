# GRPC 学习笔记

> 参考：
>
> [Grpc 官网](https://www.grpc.io/)
>
> [Protocol Buffers简明教程](https://zhuanlan.zhihu.com/p/25174418)
>
> [一文看懂 Protocol Buffer]( https://zhuanlan.zhihu.com/p/36554982)
>
> [grpc框架实战视频](https://www.bilibili.com/video/BV1GE411A7kp?from=search&seid=16186022493224318601)

## RPC 原理

**本地过程调用**

RPC就是要像调用本地的函数一样去调远程函数。在研究RPC前，我们先看看本地调用是怎么调的。假设我们要调用函数Multiply来计算lvalue * rvalue的结果:

```cpp
1 int Multiply(int l, int r) {
2    int y = l * r;
3    return y;
4 }
5 
6 int lvalue = 10;
7 int rvalue = 20;
8 int l_times_r = Multiply(lvalue, rvalue);
```

那么在第8行时，我们实际上执行了以下操作：

1. 将 lvalue 和 rvalue 的值压栈
2. 进入Multiply函数，取出栈中的值10 和 20，将其赋予 l 和 r
3. 执行第2行代码，计算 l * r ，并将结果存在 y
4. 将 y 的值压栈，然后从Multiply返回
5. 第8行，从栈中取出返回值 200 ，并赋值给 l_times_r

以上5步就是执行本地调用的过程。（20190116注：以上步骤只是为了说明原理。事实上编译器经常会做优化，对于参数和返回值少的情况会直接将其存放在寄存器，而不需要压栈弹栈的过程，甚至都不需要调用call，而直接做inline操作。仅就原理来说，这5步是没有问题的。）

**远程过程调用带来的新问题**

在远程调用时，我们需要执行的函数体是在远程的机器上的，也就是说，Multiply是在另一个进程中执行的。这就带来了几个新问题：

1. **Call ID映射**。我们怎么告诉远程机器我们要调用Multiply，而不是Add或者FooBar呢？在本地调用中，函数体是直接通过函数指针来指定的，我们调用Multiply，编译器就自动帮我们调用它相应的函数指针。但是在远程调用中，函数指针是不行的，因为两个进程的地址空间是完全不一样的。所以，在RPC中，所有的函数都必须有自己的一个ID。这个ID在所有进程中都是唯一确定的。客户端在做远程过程调用时，必须附上这个ID。然后我们还需要在客户端和服务端分别维护一个 {函数 <--> Call ID} 的对应表。两者的表不一定需要完全相同，但相同的函数对应的Call ID必须相同。当客户端需要进行远程调用时，它就查一下这个表，找出相应的Call ID，然后把它传给服务端，服务端也通过查表，来确定客户端需要调用的函数，然后执行相应函数的代码。
2. **序列化和反序列化**。客户端怎么把参数值传给远程的函数呢？在本地调用中，我们只需要把参数压到栈里，然后让函数自己去栈里读就行。但是在远程过程调用时，客户端跟服务端是不同的进程，不能通过内存来传递参数。甚至有时候客户端和服务端使用的都不是同一种语言（比如服务端用C++，客户端用Java或者Python）。这时候就需要客户端把参数先转成一个字节流，传给服务端后，再把字节流转成自己能读取的格式。这个过程叫序列化和反序列化。同理，从服务端返回的值也需要序列化反序列化的过程。
3. **网络传输**。远程调用往往用在网络上，客户端和服务端是通过网络连接的。所有的数据都需要通过网络传输，因此就需要有一个网络传输层。网络传输层需要把Call ID和序列化后的参数字节流传给服务端，然后再把序列化后的调用结果传回客户端。只要能完成这两者的，都可以作为传输层使用。因此，它所使用的协议其实是不限的，能完成传输就行。尽管大部分RPC框架都使用TCP协议，但其实UDP也可以，而gRPC干脆就用了HTTP2。Java的Netty也属于这层的东西。

有了这三个机制，就能实现RPC了，具体过程如下：

```cpp
// Client端 
//    int l_times_r = Call(ServerAddr, Multiply, lvalue, rvalue)
1. 将这个调用映射为Call ID。这里假设用最简单的字符串当Call ID的方法
2. 将Call ID，lvalue和rvalue序列化。可以直接将它们的值以二进制形式打包
3. 把2中得到的数据包发送给ServerAddr，这需要使用网络传输层
4. 等待服务器返回结果
5. 如果服务器调用成功，那么就将结果反序列化，并赋给l_times_r

// Server端
1. 在本地维护一个Call ID到函数指针的映射call_id_map，可以用std::map<std::string, std::function<>>
2. 等待请求
3. 得到一个请求后，将其数据包反序列化，得到Call ID
4. 通过在call_id_map中查找，得到相应的函数指针
5. 将lvalue和rvalue反序列化后，在本地调用Multiply函数，得到结果
6. 将结果序列化后通过网络返回给Client
```

所以要实现一个RPC框架，其实只需要按以上流程实现就基本完成了。

其中：

- Call ID映射可以直接使用函数字符串，也可以使用整数ID。映射表一般就是一个哈希表。
- 序列化反序列化可以自己写，也可以使用Protobuf或者FlatBuffers之类的。
- 网络传输库可以自己写socket，或者用asio，ZeroMQ，Netty之类。

## RPC 概述

> [grpc框架实战视频](https://www.bilibili.com/video/BV1GE411A7kp?from=search&seid=16186022493224318601) 笔记

RPC（Remote Procedure Call）远程过程（方法）调用，指在一台机器上可以像调用本地方法一样调用远程机器上的方法。具体例如函数调用栈，参数如何传递呀，返回值如何传递呀，可以参考本目录下《RPC 框架》这篇文章。

当然上面的两台机器其实并不是硬性规定，就算是在一台机器上，创建一个客户端和一个服务端，那么在客户端上也可以远程调用服务端上的方法。

整个过程就是：

1）客户端发送数据（以字节流的方式）

2）服务端接收，并解析，根据约定知道要执行什么，然后把结果返回给客户端

RPC 做的就是将上面的流程封装一下，并且使用一些大家都认可的协议来进行数据传输，让更多的人都可以访问服务端上的方法。然后可以做成一些框架，更方便地使用 RPC，例如 gRPC。

各种客户端和服务端的实现语言可以是不同的，那么怎样保证还能正常的通信调用呢，而且在本地调用方法的时候是保存在栈中的，调用远程的方法时需要一个 ID 来告诉远程的机器客户端请求的是哪一个方法。还有像参数也需要经过序列化变成一种通用的形式，在服务端的时候再经过反序列化拿到数据。关于返回的结果也需要经过序列化和反序列化的过程。因此这就需要一个通用的协议来维护这个过程，现在目前使用最广泛的就是谷歌推出的 Protobuf 协议。

它是一种轻便高效的序列化数据的协议，可用于网络通信和数据存储。

在真正的使用过程中需要定义一个中间文件（prod.proto）（Protobuf 规定的）来规范客户端和服务端的通信。

因为 protocol buffers 存在的初衷就是为了统一化传递的参数和返回值，不论用什么语言实现都可以正常传输，所以 `.proto` 文件的主要作用就是定义参数和返回值。

GRPC 的工作流程：

> 来源：官网 http://grpc.mydoc.io/?t=58009 

gRPC 提供 protocol buffer 编译插件，能够从一个服务定义的 .proto 文件生成客户端和服务端代码。通常 gRPC 用户可以在服务端实现这些API，并从客户端调用它们。

- 在服务侧，服务端实现服务接口，运行一个 gRPC 服务器来处理客户端调用。gRPC 底层架构会解码传入的请求，执行服务方法，编码服务应答。
- 在客户侧，客户端有一个*存根*实现了服务端同样的方法。客户端可以在本地存根调用这些方法，用合适的 protocol buffer 消息类型封装这些参数— gRPC 来负责发送请求给服务端并返回服务端 protocol buffer 响应。

## 3. `.proto` 文件解析

> 注意：和程序中使用的不同，这里的是学习的时候官网上的简单的示例

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
>
> ```js
> function greeter (call, callback) {
> const name = call.request.name
> ...
> }
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

如果在 `.proto` 文件中定义的 message 类型中什么也不写那么就会返回 `{}`，所以在 message 定义中是需要有属性进行接收的。

