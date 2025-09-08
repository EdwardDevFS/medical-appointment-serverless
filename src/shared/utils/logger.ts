export const logger = {
  info: (msg: string, ...args: any[]) => console.log(msg, ...args),
  error: (msg: string, ...args: any[]) => console.error(msg, ...args)
};