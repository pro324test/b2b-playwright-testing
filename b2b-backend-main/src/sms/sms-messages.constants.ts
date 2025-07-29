export const SmsMessages = {
  TEMPLATES: {
    OTP: {
      ar: 'رمز التحقق الخاص بك هو: {{otp}}',
      en: 'Your verification code is: {{otp}}'
    },
    WELCOME: {
      ar: 'مرحبا بك في المنصة!',
      en: 'Welcome to the platform!'
    },
    ORDER_CONFIRMATION: {
      ar: 'تم تأكيد طلبك رقم {{orderId}}. شكراً لك!',
      en: 'Your order #{{orderId}} has been confirmed. Thank you!'
    },
    PASSWORD_RESET: {
      ar: 'رمز إعادة تعيين كلمة المرور الخاص بك هو: {{otp}}',
      en: 'Your password reset code is: {{otp}}'
    },
    ACCOUNT_UPDATE: {
      ar: 'تم تحديث معلومات حسابك بنجاح',
      en: 'Your account information has been updated successfully'
    },
    PAYMENT_CONFIRMATION: {
      ar: 'تم تأكيد دفع مبلغ {{amount}} بنجاح',
      en: 'Payment of {{amount}} has been confirmed successfully'
    },
    DELIVERY_UPDATE: {
      ar: 'تم تحديث حالة توصيل طلبك رقم {{orderId}} إلى {{status}}',
      en: 'Delivery status for your order #{{orderId}} has been updated to {{status}}'
    }
  }
};