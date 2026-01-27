import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { IsLoggedInGuard } from 'src/auth/is-logged-in.guard';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/auth/user.decorator';

@WebSocketGateway({
  transports: ['websocket'],
})
export class PostGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly postService: PostService) {}

  handleConnection(client: Socket) {
    console.log(`클라이언트 연결됨: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`클라이언트 연결 해제됨: ${client.id}`);
  }

  @UseGuards(IsLoggedInGuard)
  @SubscribeMessage('createPost')
  async handleCreatePost(
    @User() userId: string,
    @MessageBody() data: { post: CreatePostDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const newPost = await this.postService.create(data.post, userId);

      this.server.emit('newPost', {
        ...newPost,
        message: '새로운 포스트가 생성되었습니다!',
        timestamp: new Date().toISOString(),
      });

      client.emit('postCreated', { success: true, post: newPost });
    } catch (error) {
      client.emit('error', { message: '포스트 생성에 실패했습니다.' });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(data.room);
    client.emit('joinedRoom', { room: data.room });
    console.log(`클라이언트 ${client.id}가 룸 ${data.room}에 참여했습니다.`);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(data.room);
    client.emit('leftRoom', { room: data.room });
    console.log(`클라이언트 ${client.id}가 룸 ${data.room}에서 나갔습니다.`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { room: string; message: string; userId: string },
  ) {
    this.server.to(data.room).emit('message', {
      userId: data.userId,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }
}
