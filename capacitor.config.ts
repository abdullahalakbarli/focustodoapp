import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
 
  appId: 'app.focustodo.abdullah', 


  appName: 'FocusToDo', 

  webDir: 'dist', 

  server: {
    url: 'http://localhost:5173', 
    cleartext: true
  }
};

export default config;
