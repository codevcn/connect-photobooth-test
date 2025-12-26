export enum ELogLevel {
  INFO = 'info',
  ERROR = 'error',
}

export enum EAppPage {
  INTRO = 'intro',
  SCAN_QR = 'scan-qr',
  EDIT = 'edit',
  PAYMENT = 'payment',
}

export enum EAppFeature {
  // Intro Page
  INTRO_CTA_BUTTON = 'intro-cta-button',
  INTRO_QR_CODE = 'intro-qr-code',
  // QR Scan Page
  QR_LAUNCH_CAMERA = 'qr-launch-camera',
  QR_EXTRACT_DATA = 'qr-extract-data',
  // Edit Page
  ADD_TO_CART = 'add-to-cart',
  // Payment Page
  PAYMENT_PROCEED = 'payment-proceed',
  PAYMENT_PROCESS = 'payment-process',
  PAYMENT_SUCCESS = 'payment-success',
  PAYMENT_FAILURE = 'payment-failure',
  PAYMENT_TIMEOUT = 'payment-timeout',
  PAYMENT_CANCEL = 'payment-cancel',
  // Common features
  VIRTUAL_KEYBOARD = 'virtual-keyboard',
}

export enum ELocationBoudaryType {
  PROVINCE = 0,
  DISTRICT = 1,
  WARD = 2,
}
