import { handleSignUp } from "./handlesignup.js";
import { parseBlob } from "../blobify/src/parseblob.js";

class HandleWs {
   handler = {};
   constructor(){ }

   addHandler(action, handler){
      if(!this.handler?.[action])this.handler[action] = handler;
      return
   }

   async handle(data, socket){
      const {action, data: _data} = await parseBlob(data)
      return this.handler?.[action](_data, socket)
   }

}

export const handleWs = new HandleWs();
handleWs.addHandler('signup', handleSignUp);
