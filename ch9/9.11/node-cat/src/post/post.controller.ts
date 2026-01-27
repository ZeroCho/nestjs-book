import { Controller, Get, Post, UseInterceptors, UseGuards, UploadedFile, Redirect, Inject, Body, Param, ParseIntPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { IsLoggedInGuard } from 'src/auth/is-logged-in.guard';
import multer from 'multer';
import { posts, hashtags, postsToHashtags } from 'src/drizzle/schema';
import * as schema from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { User } from 'src/auth/user.decorator';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    @Inject('DRIZZLE')
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
  }

  @UseGuards(IsLoggedInGuard)
  @UseInterceptors(NoFilesInterceptor())
  @UsePipes(new ValidationPipe({ transform: true }))
  @Redirect('/')
  @Post()
  async uploadPost(@Body() body: CreatePostDto, @User() user: Express.User) {
    await this.db.insert(posts).values({
      content: body.content,
      img: body.url,
      userId: user.id,
    });
    const result = await this.db.execute('SELECT LAST_INSERT_ID() as insertId');
    const insertId = (result[0] as unknown as { insertId: number }[])[0]?.insertId;
    const hashtag = body.content.match(/#[^\s#]*/g);
    if (insertId && hashtag) {
      const hashtagResult = await Promise.all(
        hashtag.map(async (tag) => {
          const ex = await this.db.select()
            .from(hashtags)
            .where(eq(hashtags.title, tag.slice(1).toLowerCase()))
            .limit(1);
          if (ex.length) {
            return ex[0];
          }
          await this.db.insert(hashtags).values({
            title: tag.slice(1).toLowerCase(),
          });
          const newHashtags = await this.db.select()
            .from(hashtags)
            .where(eq(hashtags.title, tag.slice(1).toLowerCase()))
            .limit(1);
          return newHashtags[0];
        }),
      );
      await this.db.insert(postsToHashtags).values(
        hashtagResult.map((h) => ({
          postId: insertId,
          hashtagId: h.id,
        })),
      );
    }
  }

  @UseGuards(IsLoggedInGuard)
  @UseInterceptors(FileInterceptor('img', {
    limits: { fileSize: 1024 * 1024 * 5 },
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
      }
    })
  }))
  @Post('img')
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/img/${file.filename}` };
  }
}
