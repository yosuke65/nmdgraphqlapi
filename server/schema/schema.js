const graphql = require("graphql");
var _ = require("lodash");
const Hobby = require("../model/Hobby");
const User = require("../model/User");
const Post = require("../model/Post");
const { remove } = require("lodash");


//Dummy data
var usersData = [
  { id: "1", name: "Bond", age: 36, profession: "Programmer" },
  { id: "13", name: "Anna", age: 26, profession: "Baker" },
  { id: "211", name: "Bella", age: 16, profession: "Mechanic" },
  { id: "19", name: "Gina", age: 26, profession: "Painter" },
  { id: "150", name: "Tom", age: 36, profession: "Teacher" },
];

var hobbiesData = [
    { id: "1", title: "Programming", description: "Using computer to make the world a better place", userId: '1' },
    { id: "2", title: "Rowing", description: "Sweat and feel better", userId: '1' },
    { id: "3", title: "Swimming", description: "Get in the water and learn to become water", userId: '13' },
    { id: "4", title: "Fencing", description: "A hobby for fency people", userId: '19' },
    { id: "5", title: "Tom", description: "Wear hiking boots abd explore the world", userId: '150' },
  ];

  var postData = [
      {id: '1', comment: 'Building a mind', userId: '1'},
      {id: '2', comment: 'GraphQL is Amazing', userId: '1'},
      {id: '3', comment: 'How to change the world', userId: '19'},
      {id: '4', comment: 'How to change the world', userId: '211'},
      {id: '5', comment: 'How to change the world', userId: '1'},

  ]

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const UserType = new GraphQLObjectType({
  name: "User",
  description: "Documentation for user...",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    profession: { type: GraphQLString },
    posts: {
        type: new GraphQLList(PostType),
        resolve(parent, args) {
            return _.filter(postData, {userId: parent.id})
        }
    },
    hobbies: {
        type: new GraphQLList(HobbyType),
        resolve(parent, args) {
            return _.filter(hobbiesData, {userId: parent.id})
        }
    }
  }),
});

const HobbyType = new GraphQLObjectType({
  name: "Hobby",
  description: "Hobby description",
  fields: () => ({
    id: {
      type: GraphQLString
    },
    title: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    user: {
        type: UserType,
        resolve(parent, args) {
            return _.find(usersData, {id: parent.userId})
        }
    }
  }),
});

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

    hobby: {
      type: HobbyType,
      args: { id: { type: GraphQLID }},

      resolve(parent, args) {
          return _.find(hobbiesData, {id: args.id})
      },
    },

    hobbies: {
        type: new GraphQLList(HobbyType),
        resolve(parent, args) {
            return hobbiesData
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
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
                profession: {type: GraphQLString}
            },
            resolve(parent, args) {
                let user = new User({
                    name: args.name,
                    age: args.age,
                    profession: args.profession
                })
                return user.save()
            }
        },

        UpdateUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: GraphQLInt},
                profession: {type: GraphQLString}
            },

            resolve(parent, args) {
                return updateUser = User.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            age: args.age,
                            profession: args.profession
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
        },

        CreateHobby: {
            type: HobbyType,
            args: {
                title: {type: new GraphQLNonNull(GraphQLString)},
                description: {type: new GraphQLNonNull(GraphQLString)},
                userId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args) {
                let hobby = new Hobby({
                    title: args.title,
                    description: args.description,
                    userId: args.userId
                })
                return hobby.save()
            }
        },
        UpdateHobby: {
            type: HobbyType,
            args: {
                id:{type: new GraphQLNonNull(GraphQLString)},
                title: {type: new GraphQLNonNull(GraphQLString)},
                description: {type: new GraphQLNonNull(GraphQLString)},
                // userId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                return updatesHobby = Hobby.findByIdAndUpdate (
                    args.id,
                    {
                        $set: {
                            title: args.title,
                            description: args.description
                        }
                    },
                    {new: true}
                )
            }
        },

        RemoveHobby: {
            type: HobbyType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args) {
                let removedHobby = Hobby.findByIdAndRemove(
                    args.id
                ).exec()

                if(!removedHobby) {
                    throw new ("Error")
                }

                return removedHobby
            }
        }
    }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
