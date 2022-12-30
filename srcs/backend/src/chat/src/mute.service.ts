import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mute } from '../typeOrm/entity/mute.entity';

@Injectable()
export class MuteService {
  constructor(
    @InjectRepository(Mute)
    private muteRepo: Repository<Mute>,
  ) {}

  async muteUser(login: string, roomId: string, minutes: number) {
    const mute = await this.muteRepo.findOne({ where: { login, roomId } });
    return this.muteRepo.save({
      ...(mute || {}),
      login,
      roomId,
      mutedUntil: Date.now() + 60000 * minutes,
    });
  }

  async getUserMute(login: string, roomId: string) {
    const mute = await this.muteRepo.findOne({ where: { login, roomId } });
    if (!mute) 
		return 0;
    else 
		return mute.mutedUntil;
  }
}