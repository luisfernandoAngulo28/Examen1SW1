import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(client.id, userId);
    }
    this.broadcastOnlineUsers();
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.broadcastOnlineUsers();
  }

  /** Broadcast the list of connected user IDs */
  private broadcastOnlineUsers() {
    const uniqueUsers = [...new Set(this.connectedUsers.values())];
    this.server.emit('users:online', uniqueUsers);
  }

  /** Emit when a case is started */
  emitCaseStarted(caseData: any) {
    this.server.emit('case:started', caseData);
  }

  /** Emit when a task is completed and workflow advances */
  emitTaskCompleted(caseData: any) {
    this.server.emit('task:completed', caseData);
  }

  /** Emit when a task is assigned */
  emitTaskAssigned(taskData: any) {
    this.server.emit('task:assigned', taskData);
  }

  /** Emit when a case is completed */
  emitCaseCompleted(caseData: any) {
    this.server.emit('case:completed', caseData);
  }

  /** Emit when a case is cancelled */
  emitCaseCancelled(caseData: any) {
    this.server.emit('case:cancelled', caseData);
  }
}
