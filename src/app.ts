import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import { schema, root } from './controller/graphql'
const app = express()

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}))

// 公开public文件夹，让用户可以访问里面的静态资源，例如index.html
app.use(express.static('public'))

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))
