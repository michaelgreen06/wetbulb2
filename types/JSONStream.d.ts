declare module 'JSONStream' {
  import { Transform } from 'stream';
  
  interface JSONStreamStatic {
    parse(pattern: string): Transform;
    stringify(): Transform;
  }
  
  const JSONStream: JSONStreamStatic;
  export = JSONStream;
}
