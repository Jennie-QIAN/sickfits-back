import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session';
const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, //how long they stay signed in?
  secret: process.env.COOKIE_SECRET,
}

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    //TODO: Add in initial roles here
  }
})

export default withAuth(config({
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    },
  },
  db: {
    adapter: 'mongoose',
    url: databaseURL,
    async onConnect(keystone) {
      if(process.argv.includes('--seed-data')) {
        await insertSeedData(keystone);
      }     
    },
  },
  lists: createSchema({
    User,
    Product,
    ProductImage,
  }),
  ui: {
    //show the ui only for people who pass this test
    isAccessAllowed: ({ session }) => {
      return !!session?.data; 
      //if there is a session AND there is session.data, it will return true
      //put 2 bans to coherse it into a boolean
    },
  },
  session: withItemData(statelessSessions(sessionConfig), {
    //GraphQL query. can be User: `id email`
    User: `id`
  })
}));