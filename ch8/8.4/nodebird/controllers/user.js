"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.follow = void 0;
const connection_1 = __importDefault(require("../drizzle/connection"));
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const follow = async (req, res, next) => {
    try {
        if (typeof req.params.id !== 'string') {
            return res.status(400).send('id_must_be_string');
        }
        const user = await connection_1.default.select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, req.user.id))
            .limit(1);
        if (user.length) {
            await connection_1.default.insert(schema_1.follows).values({
                followerId: req.user.id,
                followingId: req.params.id,
            });
            res.send('success');
        }
        else {
            res.status(404).send('no_user');
        }
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.follow = follow;
