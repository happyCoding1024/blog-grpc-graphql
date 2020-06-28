"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const graphqlHTTP = require("express-graphql");
const graphql_1 = require("./controller/graphql");
const app = express();
app.use('/graphql', graphqlHTTP({
    schema: graphql_1.schema,
    rootValue: graphql_1.root,
    graphiql: true
}));
// 公开public文件夹，让用户可以访问里面的静态资源，例如index.html
app.use(express.static('public'));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
