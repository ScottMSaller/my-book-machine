import { AuthenticationError } from 'apollo-server-express';
import { User } from '../models/index.js'; // Adjust the path if necessary
import { signToken  } from '../services/auth.js'; // Assume you have a utility to create tokens

  
const resolvers = {
  Query: {
    // Fetch the logged-in user's data
    me: async (_:any, _args: any, context: { user: { _id: any; }; }) => {
      if (context.user) {
        return User.findById(context.user._id).populate('savedBooks');
      }
      throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {
    // Register a new user and return an auth token
    addUser: async (_parent: any, { username, email, password }: any) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    // Log in an existing user and return an auth token
    login: async (_parent: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },

    // Save a book to the user's savedBooks array
    saveBook: async (_parent: any, { input }: any, context: { user: { _id: any; }; }) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: input } }, // $addToSet avoids duplicates
          { new: true }
        ).populate('savedBooks');
      }
      throw new AuthenticationError('Not logged in');
    },

    // Remove a book from the user's savedBooks array by bookId
    removeBook: async (_parent: any, { bookId }: any, context: { user: { _id: any; }; }) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');
      }
      throw new AuthenticationError('Not logged in');
    },
  },
};

export default resolvers;
