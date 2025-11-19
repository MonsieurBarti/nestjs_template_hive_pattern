export const LocalLoggerConfig = {
  pino: {
    transport: {
      target: 'pino-pretty',
      options: {
        singleLine: true,
      },
    },
  },
  enabledModules: [] as string[],
  disabledModules: [] as string[],
  showFullRequest: false,
  moduleColors: {} as Record<string, string>,
  showDataField: true,
  showErrors: true,
};
