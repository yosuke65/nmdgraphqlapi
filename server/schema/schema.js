const graphql = require("graphql");
var _ = require("lodash");
const User = require("../model/User");
const LoginResponse = require("../model/LoginResponse");
const Post = require("../model/Post");
const { remove } = require("lodash");
const pick = require("lodash").pick;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

// keep this secret in a safe env and make it as strong as possible
const SECRET = "createaverystrongsec34!retthatalsoincludes2423412wdsa324e34e";

const UserType = new GraphQLObjectType({
  name: "User",
  description: "Documentation for user...",
  fields: () => ({
    id: { type: GraphQLString },
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    age: { type: GraphQLInt },
    email: { type: GraphQLString },
    posts: {
        type: new GraphQLList(PostType),
        resolve(parent, args) {
            return _.filter(postData, {userId: parent.id})
        }
    }
  }),
});

const LoginResponseType = new GraphQLObjectType({
    name: "Response",
    description: "Login status",
    fields: () => ({
        status: {type: GraphQLBoolean},
        token: {type: GraphQLString}
    })
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    description: 'Post description',
    fields: () => ({
        id: {type: GraphQLString},
        comment: {type: GraphQLString},
        user: {
            type: UserType,
            resolve(parent, args) {
                return _.find(usersData, {id: parent.userId})
            }
        }
    })

})

//RootQuery
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Description",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },

      resolve(parent, args) {
        return _.find(usersData, { id: args.id });
      },
    },

    users: {
        type: new GraphQLList(UserType),
        resolve(parent, args) {
            return usersData
        }
    },

    post: {
        type: PostType,
        args: {id: {type: GraphQLID}},
        resolve(parent, args) {
            return _.find(postData, {id: args.id})
        }
    },

    posts: {
        type: new GraphQLList(PostType),
        resolve(parent, args){
            return postData
        }
    }
  },
});


//Mutations
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
         CreateUser: {
            type: UserType,
            args: {
                firstname: {type: new GraphQLNonNull(GraphQLString)},
                lastname: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: GraphQLInt},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve :async (parent, args) =>{
                let user = new User({
                    firstname: args.firstname,
                    lastname: args.lastname,
                    age: args.age,
                    email: args.email,
                    password: await bcrypt.hash(args.password, 12)
                })
                return user.save()
            }
        },

       Login: {
            type: LoginResponseType,
            args: {
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve: async (parent, args) => {
                const user = await User.findOne({ 'email': args.email });
           
                if(!user) {
                    throw new Error("No user found ");
                }
                const isValid = await bcrypt.compare(args.password, user.password);
                if (!isValid) {
                  throw new Error("Incorrect password ");
                }
                
                const token = await jwt.sign(
                    {
                      user: pick(user, ["_id", "email"])
                    },
                    SECRET,
                    // this token will last for a day, but you can change it
                    // check the jsonwebtoken for more on this
                    { expiresIn: "1d" }
                  );

                  const response = new LoginResponse({
                        status: true,
                        token: token, 
                    })
                    
                  return response;
            }
        },

        UpdateUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstname: {type: new GraphQLNonNull(GraphQLString)},
                lastname: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: GraphQLInt},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
            },

            resolve(parent, args) {
                return updateUser = User.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            firstname: args.firstname,
                            lastname: args.lastname,
                            age: args.age,
                            email: args.email,
                            password: args.password
                        }
                    },
                    {new: true}
                )
            }
        },

        //Remove user
        RemoveUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args) {
                let removedUser = User.findByIdAndRemove(
                    args.id
                ).exec()

                if(!removedUser) {
                    throw new ("Error")
                }

                return removedUser
            }
        },

        CreatePost: {
            type: PostType,
            args: {
                comment: {type: new GraphQLNonNull(GraphQLString)},
                userId: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args) {
                let post = new Post ({
                    comment: args.comment,
                    userId: args.userId
                })
                return post.save()
            }
        },

        UpdatePost: {
            type: PostType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                comment: {type: new GraphQLNonNull(GraphQLString)},
                // userId: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args) {
                return updatePost = Post.findByIdAndUpdate(
                    args.id,
                    {
                        $set : {
                            comment: args.comment,
                        }
                    },
                    {new: true}
                )
            }
        },

        RemovePost: {
            type: PostType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                let removedPost = Post.findByIdAndRemove(
                    args.id
                ).exec()

                if(!removedPost) {
                    throw new ("Error")
                }

                return removedPost
            }
        }
    }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
