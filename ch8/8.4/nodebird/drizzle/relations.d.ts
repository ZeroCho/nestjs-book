export declare const postsRelations: import("drizzle-orm/relations").Relations<"posts", {
    user: import("drizzle-orm/relations").One<"users", true>;
    postsToHashtags: import("drizzle-orm/relations").Many<"posts_to_hashtags">;
}>;
export declare const hashtagRelations: import("drizzle-orm/relations").Relations<"hashtags", {
    postsToHashtags: import("drizzle-orm/relations").Many<"posts_to_hashtags">;
}>;
export declare const postsToHashtagsRelations: import("drizzle-orm/relations").Relations<"posts_to_hashtags", {
    post: import("drizzle-orm/relations").One<"posts", true>;
    hashtag: import("drizzle-orm/relations").One<"hashtags", true>;
}>;
export declare const usersRelations: import("drizzle-orm/relations").Relations<"users", {
    posts: import("drizzle-orm/relations").Many<"posts">;
    followers: import("drizzle-orm/relations").Many<"follows">;
    followings: import("drizzle-orm/relations").Many<"follows">;
}>;
export declare const followsRelations: import("drizzle-orm/relations").Relations<"follows", {
    follower: import("drizzle-orm/relations").One<"users", true>;
    following: import("drizzle-orm/relations").One<"users", true>;
}>;
