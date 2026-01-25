"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPost = exports.afterUploadImage = void 0;
const connection_1 = __importDefault(require("../drizzle/connection"));
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const afterUploadImage = (req, res) => {
    console.log(req.file);
    res.json({ url: `/img/${req.file?.filename}` });
};
exports.afterUploadImage = afterUploadImage;
const uploadPost = async (req, res, next) => {
    try {
        await connection_1.default.insert(schema_1.posts).values({
            content: req.body.content,
            img: req.body.url,
            userId: req.user.id,
        });
        const result = await connection_1.default.execute('SELECT LAST_INSERT_ID() as insertId');
        const insertId = result[0][0]?.insertId;
        const hashtag = req.body.content.match(/#[^\s#]*/g);
        if (insertId && hashtag) {
            const result = await Promise.all(hashtag.map(async (tag) => {
                const title = tag.slice(1).toLowerCase();
                const exHashtag = await connection_1.default.select()
                    .from(schema_1.hashtags)
                    .where((0, drizzle_orm_1.eq)(schema_1.hashtags.title, title))
                    .limit(1);
                if (exHashtag.length) {
                    return exHashtag[0];
                }
                await connection_1.default.insert(schema_1.hashtags).values({ title });
                const newHashtag = await connection_1.default.select()
                    .from(schema_1.hashtags)
                    .where((0, drizzle_orm_1.eq)(schema_1.hashtags.title, title))
                    .limit(1);
                return newHashtag[0];
            }));
            await connection_1.default.insert(schema_1.postsToHashtags).values(result.map((h) => ({
                postId: insertId,
                hashtagId: h.id,
            })));
        }
        res.redirect('/');
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.uploadPost = uploadPost;
