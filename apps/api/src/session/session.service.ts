import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, SessionStatus } from '@prisma/client';
import {
  PauseSessionDto,
  ResumeSessionDto,
  StartSessionDto,
  StopSessionDto,
} from './session.schema';
import { TimeEngine } from '../time/time.engine';

@Injectable()
export class SessionService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async getCurrentSession(userId = 'default') {
    return this.workSession.findFirst({
      where: { userId, status: { in: [SessionStatus.ACTIVE, SessionStatus.PAUSED] } },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getStatus(userId = 'default') {
    const current = await this.getCurrentSession(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const now = new Date();
    const monday = new Date(now);
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
    monday.setDate(now.getDate() - day);
    monday.setHours(0, 0, 0, 0);

    const allSessions = await this.workSession.findMany({
      where: { userId, startedAt: { gte: monday } },
    });

    const dailyBalance = TimeEngine.dailyBalanceSeconds(allSessions);
    const weeklyBalance = TimeEngine.weeklyBalanceSeconds(allSessions);

    return {
      currentSession: current ?? null,
      status: current?.status ?? 'NONE',
      dailyBalance: {
        seconds: dailyBalance,
        formatted: TimeEngine.formatDuration(dailyBalance),
      },
      weeklyBalance: {
        seconds: weeklyBalance,
        formatted: TimeEngine.formatDuration(weeklyBalance),
      },
    };
  }

  async startSession(dto: StartSessionDto) {
    const userId = dto.userId ?? 'default';

    const existing = await this.getCurrentSession(userId);
    if (existing) {
      throw new Error(
        `Une session est déjà en cours (id: ${existing.id}, statut: ${existing.status}).`,
      );
    }

    return this.workSession.create({
      data: {
        userId,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async stopSession(userId = 'default', dto: StopSessionDto) {
    const session = await this.getCurrentSession(userId);
    if (!session) {
      throw new Error("Aucune session active ou en pause n'a été trouvée.");
    }

    const endedAt = dto.endedAt ? new Date(dto.endedAt) : new Date();

    // If paused, add remaining pause time
    let pauseDuration = session.pauseDuration;
    if (session.status === SessionStatus.PAUSED && session.pausedAt) {
      pauseDuration += Math.floor(
        (endedAt.getTime() - session.pausedAt.getTime()) / 1000,
      );
    }

    return this.workSession.update({
      where: { id: session.id },
      data: { endedAt, pauseDuration, status: SessionStatus.COMPLETED },
    });
  }

  async pauseSession(userId = 'default', dto: PauseSessionDto) {
    const session = await this.getCurrentSession(userId);
    if (!session) {
      throw new Error("Aucune session active n'a été trouvée.");
    }
    if (session.status === SessionStatus.PAUSED) {
      throw new Error('La session est déjà en pause.');
    }

    return this.workSession.update({
      where: { id: session.id },
      data: {
        pausedAt: dto.pausedAt ? new Date(dto.pausedAt) : new Date(),
        status: SessionStatus.PAUSED,
      },
    });
  }

  async resumeSession(userId = 'default', dto: ResumeSessionDto) {
    const session = await this.getCurrentSession(userId);
    if (!session) {
      throw new Error("Aucune session en pause n'a été trouvée.");
    }
    if (session.status !== SessionStatus.PAUSED) {
      throw new Error("La session n'est pas en pause.");
    }

    const resumedAt = dto.resumedAt ? new Date(dto.resumedAt) : new Date();
    const additionalPause = session.pausedAt
      ? Math.floor(
          (resumedAt.getTime() - session.pausedAt.getTime()) / 1000,
        )
      : 0;

    return this.workSession.update({
      where: { id: session.id },
      data: {
        pausedAt: null,
        pauseDuration: session.pauseDuration + additionalPause,
        status: SessionStatus.ACTIVE,
      },
    });
  }
}
