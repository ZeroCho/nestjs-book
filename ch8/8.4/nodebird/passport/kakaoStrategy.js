"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_kakao_1 = require("passport-kakao");
const connection_1 = __importDefault(require("../drizzle/connection"));
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../drizzle/schema");
exports.default = () => {
    passport_1.default.use(new passport_kakao_1.Strategy({
        clientID: process.env.KAKAO_ID,
        clientSecret: process.env.KAKAO_SECRET,
        callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try {
            const exUser = await connection_1.default.select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.id, String(profile.id)), (0, drizzle_orm_1.eq)(schema_1.users.provider, 'kakao')))
                .limit(1);
            if (exUser.length) {
                done(null, exUser[0]);
            }
            else {
                await connection_1.default.insert(schema_1.users).values({
                    id: String(profile.id),
                    nick: profile.displayName,
                    provider: 'kakao',
                });
                const newUser = await connection_1.default.select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.id, String(profile.id)), (0, drizzle_orm_1.eq)(schema_1.users.provider, 'kakao')))
                    .limit(1);
                done(null, newUser[0]);
            }
        }
        catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
