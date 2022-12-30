import { User } from './entities/User'
import { TypeormSession} from './entities/Session'
import { Friend } from './entities/FriendRequest';

export const  entities = [ User, TypeormSession, Friend ];

export { User,  TypeormSession, Friend}
