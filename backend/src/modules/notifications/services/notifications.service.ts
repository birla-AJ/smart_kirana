import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { SmsService } from '../../../sms/sms.service';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { NotificationEntity } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private mailer: nodemailer.Transporter | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {
    this.initFirebase();
  }

  private initFirebase(): void {
    if (admin.apps.length > 0) return;

    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not configured; push notifications will be logged, not sent.');
      return;
    }

    admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
  }

  private getMailer(): nodemailer.Transporter | null {
    if (this.mailer) return this.mailer;

    const host = this.configService.get<string>('email.host');
    const user = this.configService.get<string>('email.user');
    const password = this.configService.get<string>('email.password');

    if (!host || !user || !password) {
      this.logger.warn('SMTP credentials not configured; emails will be logged, not sent.');
      return null;
    }

    this.mailer = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: { user, pass: password },
    });
    return this.mailer;
  }

  /** Creates a Notification row and attempts delivery through the requested channel. */
  async notify(userId: string, title: string, message: string, type: NotificationType): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: { userId, title, message, type, status: NotificationStatus.PENDING },
    });

    try {
      if (type === NotificationType.IN_APP) {
        // Nothing to deliver externally — it's read directly from the inbox.
      } else if (type === NotificationType.PUSH) {
        await this.deliverPush(userId, title, message);
      } else if (type === NotificationType.EMAIL) {
        await this.deliverEmail(userId, title, message);
      } else if (type === NotificationType.SMS) {
        await this.deliverSms(userId, message);
      }

      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.SENT },
      });
    } catch (error) {
      this.logger.error(`Failed to deliver ${type} notification to user ${userId}`, error as Error);
      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.FAILED },
      });
    }
  }

  private async deliverPush(userId: string, title: string, message: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { userId, isActive: true, fcmToken: { not: null } },
      orderBy: { lastActiveAt: 'desc' },
    });

    if (!session?.fcmToken || admin.apps.length === 0) {
      this.logger.warn(`Push not delivered for user ${userId} (no device token or Firebase not configured).`);
      return;
    }

    await admin.messaging().send({
      token: session.fcmToken,
      notification: { title, body: message },
    });
  }

  private async deliverEmail(userId: string, title: string, message: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const mailer = this.getMailer();

    if (!user?.email || !mailer) {
      this.logger.warn(`Email not delivered for user ${userId} (no email on file or SMTP not configured).`);
      return;
    }

    await mailer.sendMail({
      from: this.configService.get<string>('email.from'),
      to: user.email,
      subject: title,
      text: message,
    });
  }

  private async deliverSms(userId: string, message: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    await this.smsService.sendSms(user.mobile, message);
  }

  /** Admin broadcast to specific users and/or an entire role in one call. */
  async sendToMany(dto: SendNotificationDto): Promise<{ recipients: number }> {
    const userIds = new Set(dto.userIds ?? []);

    if (dto.role) {
      const users = await this.prisma.user.findMany({
        where: { role: { name: dto.role } },
        select: { id: true },
      });
      users.forEach((u) => userIds.add(u.id));
    }

    await Promise.all(
      Array.from(userIds).map((userId) => this.notify(userId, dto.title, dto.message, dto.type)),
    );

    return { recipients: userIds.size };
  }

  async findAllForUser(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<NotificationEntity>> {
    const where = { userId };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return buildPaginatedResponse(rows, totalItems, query.page ?? 1, query.take);
  }

  async markRead(userId: string, id: string): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { status: NotificationStatus.READ } });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, status: { not: NotificationStatus.READ } },
      data: { status: NotificationStatus.READ },
    });
  }
}
