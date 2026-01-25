"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../middlewares");
const page_1 = require("../controllers/page");
const router = express_1.default.Router();
router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user?.followers?.length || 0;
    res.locals.followingCount = req.user?.followings?.length || 0;
    res.locals.followingIdList = req.user?.followings?.map(f => f.following.id) || [];
    next();
});
router.get('/profile', middlewares_1.isLoggedIn, page_1.renderProfile);
router.get('/join', middlewares_1.isNotLoggedIn, page_1.renderJoin);
router.get('/', page_1.renderMain);
router.get('/search', page_1.renderHashtag);
exports.default = router;
