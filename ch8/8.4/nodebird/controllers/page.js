"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderJoin = exports.renderMain = exports.renderProfile = exports.renderHashtag = void 0;
const connection_1 = __importDefault(require("../drizzle/connection"));
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const renderProfile = (req, res) => {
    res.render('profile', { title: '내 정보 - NodeBird' });
};
exports.renderProfile = renderProfile;
const renderJoin = (req, res) => {
    res.render('join', { title: '회원 가입 - NodeBird' });
};
exports.renderJoin = renderJoin;
const renderMain = async (req, res, next) => {
    try {
        const twits = await connection_1.default.query.posts.findMany({
            with: {
                user: true,
            },
            orderBy: (posts) => (0, drizzle_orm_1.desc)(posts.createdAt),
        });
        res.render('main', {
            title: 'NodeBird',
            twits,
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.renderMain = renderMain;
const renderHashtag = async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/');
    }
    try {
        const result = await connection_1.default
            .select({ posts: schema_1.posts, user: { id: schema_1.users.id, nick: schema_1.users.nick } })
            .from(schema_1.posts)
            .innerJoin(schema_1.postsToHashtags, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.postsToHashtags.postId))
            .innerJoin(schema_1.hashtags, (0, drizzle_orm_1.eq)(schema_1.hashtags.id, schema_1.postsToHashtags.hashtagId))
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.posts.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.hashtags.title, query))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt));
        return res.render('main', {
            title: `${query} | NodeBird`,
            twits: result.map(row => ({ ...row.posts, user: row.user })),
        });
    }
    catch (error) {
        console.error(error);
        return next(error);
    }
};
exports.renderHashtag = renderHashtag;
