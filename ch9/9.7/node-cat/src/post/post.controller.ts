import { Controller, Post, UseInterceptors, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { IsLoggedInGuard } from 'src/auth/is-logged-in.guard';
import multer from 'multer';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(IsLoggedInGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post()
  uploadPost() {}

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
  uploadImage() {}
}
