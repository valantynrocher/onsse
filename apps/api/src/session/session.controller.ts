import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { SessionService } from './session.service';
import {
  PauseSessionSchema,
  ResumeSessionSchema,
  StartSessionSchema,
  StopSessionSchema,
} from './session.schema';
import { zodToHalFormProperties } from '../hal/hal-forms';

const API_BASE_URL =
  process.env.API_BASE_URL ?? 'http://localhost:3001';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /** Templates des actions disponibles selon l'état de la session */
  private buildTemplates(status: string) {
    const templates: Record<string, object> = {};

    if (status === 'NONE' || status === 'COMPLETED') {
      templates['start'] = {
        title: 'Démarrer une session de travail',
        method: 'POST',
        action: `${API_BASE_URL}/session/start`,
        contentType: 'application/json',
        properties: zodToHalFormProperties(StartSessionSchema),
      };
    }

    if (status === 'ACTIVE') {
      templates['stop'] = {
        title: 'Terminer la session de travail',
        method: 'POST',
        action: `${API_BASE_URL}/session/stop`,
        contentType: 'application/json',
        properties: zodToHalFormProperties(StopSessionSchema),
      };
      templates['pause'] = {
        title: 'Mettre en pause la session',
        method: 'POST',
        action: `${API_BASE_URL}/session/pause`,
        contentType: 'application/json',
        properties: zodToHalFormProperties(PauseSessionSchema),
      };
    }

    if (status === 'PAUSED') {
      templates['resume'] = {
        title: 'Reprendre la session',
        method: 'POST',
        action: `${API_BASE_URL}/session/resume`,
        contentType: 'application/json',
        properties: zodToHalFormProperties(ResumeSessionSchema),
      };
      templates['stop'] = {
        title: 'Terminer la session de travail',
        method: 'POST',
        action: `${API_BASE_URL}/session/stop`,
        contentType: 'application/json',
        properties: zodToHalFormProperties(StopSessionSchema),
      };
    }

    return templates;
  }

  @Get('current')
  async getCurrent(@Query('userId') userId = 'default') {
    const data = await this.sessionService.getStatus(userId);
    const templates = this.buildTemplates(data.status);
    return { ...data, _templates: templates };
  }

  @Post('start')
  async start(@Body() body: unknown) {
    const dto = StartSessionSchema.safeParse(body ?? {});
    if (!dto.success) {
      throw new HttpException(dto.error.format(), HttpStatus.BAD_REQUEST);
    }
    try {
      const session = await this.sessionService.startSession(dto.data);
      return { message: 'Session démarrée.', session };
    } catch (e: unknown) {
      throw new HttpException(
        (e as Error).message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('stop')
  async stop(@Body() body: unknown, @Query('userId') userId = 'default') {
    const dto = StopSessionSchema.safeParse(body ?? {});
    if (!dto.success) {
      throw new HttpException(dto.error.format(), HttpStatus.BAD_REQUEST);
    }
    try {
      const session = await this.sessionService.stopSession(userId, dto.data);
      return { message: 'Session terminée.', session };
    } catch (e: unknown) {
      throw new HttpException(
        (e as Error).message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('pause')
  async pause(@Body() body: unknown, @Query('userId') userId = 'default') {
    const dto = PauseSessionSchema.safeParse(body ?? {});
    if (!dto.success) {
      throw new HttpException(dto.error.format(), HttpStatus.BAD_REQUEST);
    }
    try {
      const session = await this.sessionService.pauseSession(userId, dto.data);
      return { message: 'Session mise en pause.', session };
    } catch (e: unknown) {
      throw new HttpException(
        (e as Error).message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('resume')
  async resume(@Body() body: unknown, @Query('userId') userId = 'default') {
    const dto = ResumeSessionSchema.safeParse(body ?? {});
    if (!dto.success) {
      throw new HttpException(dto.error.format(), HttpStatus.BAD_REQUEST);
    }
    try {
      const session = await this.sessionService.resumeSession(userId, dto.data);
      return { message: 'Session reprise.', session };
    } catch (e: unknown) {
      throw new HttpException(
        (e as Error).message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
