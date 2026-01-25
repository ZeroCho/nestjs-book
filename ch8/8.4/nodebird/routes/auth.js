"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const middlewares_1 = require("../middlewares");
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
router.post('/join', middlewares_1.isNotLoggedIn, auth_1.join);
router.post('/login', middlewares_1.isNotLoggedIn, auth_1.login);
router.get('/logout', middlewares_1.isLoggedIn, auth_1.logout);
router.get('/kakao', passport_1.default.authenticate('kakao'));
router.get('/kakao/callback', passport_1.default.authenticate('kakao', {
    failureRedirect: '/?loginError=카카오 로그인 실패',
}), (req, res) => {
    res.redirect('/');
});
exports.default = router;
