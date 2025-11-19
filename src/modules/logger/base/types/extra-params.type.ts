/**
 * Available module names for logger context
 * Organized by category for clarity and maintenance
 *
 * This const object serves as the single source of truth for valid module names.
 * The LoggerModuleName type is derived from this object to ensure type safety.
 */
export const LoggerModuleNames = {
  // Modern modules (src/modules/)
  BOT_DETECTION: 'bot-detection',
  HUB_REWARDS: 'hub-rewards',
  HOLD_TO_EARN: 'hold-to-earn',
  TRADE_TO_EARN: 'trade-to-earn',
  VOUCHER: 'voucher',
  BULLMQ: 'bullmq',
  SOCIALS: 'socials',
  QUESTS: 'quests',
  LOTTERY: 'lottery',
  SPINNING_WHEEL: 'spinning-wheel',
  SPINNING_WHEEL_TMA: 'spinning-wheel-tma',
  TOKEN_SELLING: 'token-selling',
  CAMPAIGN_STP_REPORT: 'campaign-stp-report',
  REFERRAL_MONITORING: 'referral-monitoring',
  MAINTENANCE: 'maintenance',
  SKYWALKER: 'skywalker',
  INTERNAL_TOOLS: 'internal-tools',
  NOTIFICATIONS: 'notifications',
  SHARED: 'shared',

  // Legacy routes (src/routes/)
  LEGACY_TRADE: 'legacy-trade',
  LEGACY_PRICE: 'legacy-price',
  LEGACY_TOKENS: 'legacy-tokens',
  LEGACY_EXCHANGE: 'legacy-exchange',
  LEGACY_HUB_USER: 'legacy-hub-user',
  LEGACY_HUB_STATS: 'legacy-hub-stats',
  LEGACY_HUB_AUTH: 'legacy-hub-auth',
  LEGACY_HUB_LEADERBOARD: 'legacy-hub-leaderboard',
  LEGACY_HUB_NOTIFICATIONS: 'legacy-hub-notifications',
  LEGACY_HUB_REFERRAL: 'legacy-hub-referral',
  LEGACY_PARAMETER_STORE: 'legacy-parameterStore',
  LEGACY_INTERNAL: 'legacy-internal',
  LEGACY_HUB_TRADE_REPORTING: 'legacy-hub-tradeReporting',
  LEGACY_HUB_TURNSTILE: 'legacy-hub-turnstile',
  LEGACY_HUB_TRADEGUARD: 'legacy-hub-tradeGuard',
  LEGACY_HUB_SDK: 'legacy-hub-sdk',
  LEGACY_HUB_OAUTH: 'legacy-hub-oauth',
  LEGACY_HUB_FRAUD_MIXPANEL: 'legacy-hub-mixpanel',
  LEGACY_HUB_FRAUD_DETECTION: 'legacy-hub-fraudDetection',
  LEGACY_HUB_EXTERNAL_CAMPAIGNS: 'legacy-hub-externalCampaigns',
  LEGACY_HEALTH: 'legacy-health',

  // Utilities (src/util/)
  CACHE: 'cache',
  QUEUE: 'queue',
  WALLET: 'wallet',
  NETWORK: 'network',
  RATE_LIMITER: 'rate-limiter',
  REDLOCK: 'redlock',
  RETRIER: 'retrier',
  LOCAL_CACHE_SYNC: 'local-cache-sync',
  GUARDS: 'guards',
  EXCEPTION_FILTER: 'exception-filter',
  FEATURES_MANAGEMENT: 'features-management',
  ALERT: 'alert',
  PROVIDERS: 'providers',
  TEST_LOGGER: 'test-logger',

  // SDK (core/sdk)
  SDK: 'sdk',

  // CQRS (src/logging)
  CQRS: 'cqrs',

  // Request tracking
  REQUEST_TRACKER: 'request-tracker',

  // Bootstrap
  BOOTSTRAP: 'bootstrap',
} as const;

/**
 * Type representing all valid module names
 * Extracted from LoggerModuleNames const object
 *
 * This ensures compile-time type safety when creating child loggers:
 * @example
 * // ✅ Valid - TypeScript accepts
 * logger.createChild({ moduleName: 'trade-to-earn', className: Foo.name })
 *
 * // ❌ Invalid - TypeScript error
 * logger.createChild({ moduleName: 'invalid-module', className: Foo.name })
 */
export type LoggerModuleName =
  (typeof LoggerModuleNames)[keyof typeof LoggerModuleNames];

/**
 * Logger extra parameters with type-safe module names
 *
 * @property appName - Application identifier (e.g., 'api', 'kenobi')
 * @property moduleName - Type-safe module name from LoggerModuleName union type
 * @property className - Class name for debugging and filtering (e.g., MyService.name)
 */
export type LoggerExtraParams = {
  appName: string;
  moduleName?: LoggerModuleName;
  className?: string;
};
