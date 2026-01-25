"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.join = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const connection_1 = __importDefault(require("../drizzle/connection"));
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../drizzle/schema");
const join = async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await connection_1.default.select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, email))
            .limit(1);
        if (exUser.length) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt_1.default.hash(password, 12);
        await connection_1.default.insert(schema_1.users).values({
            id: email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    }
    catch (error) {
        console.error(error);
        return next(error);
    }
};
exports.join = join;
const login = (req, res, next) => {
    passport_1.default.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
};
exports.login = login;
const logout = (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
};
exports.logout = logout;
