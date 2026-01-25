"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const localStrategy_1 = __importDefault(require("./localStrategy"));
const kakaoStrategy_1 = __importDefault(require("./kakaoStrategy"));
const connection_1 = __importDefault(require("../drizzle/connection"));
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../drizzle/schema");
exports.default = () => {
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await connection_1.default.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
                columns: {
                    password: false,
                },
                with: {
                    followers: {
                        with: {
                            follower: {
                                columns: {
                                    id: true,
                                    nick: true,
                                }
                            },
                        }
                    },
                    followings: {
                        with: {
                            following: {
                                columns: {
                                    id: true,
                                    nick: true,
                                }
                            }
                        }
                    },
                }
            });
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    });
    (0, localStrategy_1.default)();
    (0, kakaoStrategy_1.default)();
};
