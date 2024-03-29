//import { modules } from "../lib.js";
import {
   blobify,
   bufferToBase64URLString, base64url_to_string,
   decoder, userData
} from './deps.js';

function isIdNotEqToRawId(id, rawId) {
   return bufferToBase64URLString(rawId) !== id
}

function isChallengeNotMatch(base64url_challenge) {
   const challenge = base64url_to_string(base64url_challenge);
   const expectedChallenge = sessionStorage.getItem('session')
   return challenge !== expectedChallenge;
}

export async function handleSignUp(data, sock) {
   function sendBlob(data) {
      sock.send(blobify(data));
      return;
   }
   const {
      name, id, rawId, type,
      authenticatorAttachment,
      response: attestationResponse } = data;

   if (!id) return sendBlob({
      success: false,
      message: 'Missing credential ID'
   })

   if (isIdNotEqToRawId(id, rawId)) return sendBlob({
      success: false,
      message: 'Credential ID is not equal to raw ID'
   })

   if (type !== 'public-key') return sendBlob({
      success: false,
      message: `Unexpected credential type ${type}, expected "public-key"`
   })

   const { attestationObject: attsBuffer, clientDataJSON: clientDataBuffer, transports, publicKeyAlgorithm, publicKey: pkBuffer, authenticatorData: authBuffer } = attestationResponse

   const clientDataJSON = decoder.decode(clientDataBuffer);
   const clientData = JSON.parse(clientDataJSON);
   const { type: webauthType, challenge: base64url_challenge, origin, tokenBinding } = clientData;

   if (webauthType !== 'webauthn.create') return sendBlob({
      success: false,
      message: `Unexpected authentication webauthn type: ${webauthType}, expected "webauthn.create"`
   })

   if (isChallengeNotMatch(base64url_challenge)) return sendBlob({
      success: false,
      message: `Unexpected authentication response challenge "${challenge}", expected "${expectedChallenge}"`
   })

   const _userData = {
      name, id, rawId, type,
      authenticatorAttachment,
      attestationResponse
   }
   debugger;
   const result = await userData.addUser(name, _userData);
   debugger;
   const session = sessionStorage.getItem('session');
   sessionStorage.setItem(session, id)// to keep track user login data
   return sock.send(blobify({
      status: 'success',
      message: `${name} is successfully registered`,
      data: {
         name, id
      }
   }))
}