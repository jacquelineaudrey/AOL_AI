declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      // Add enviroment varibles type definitions here
    }
  }
}

// Converts this file into the module system.
export {};
