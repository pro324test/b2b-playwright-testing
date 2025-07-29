export const OtpMessages = {
  SUCCESS: {
    OTP_SENT: 'OTP code has been sent successfully',
    OTP_VERIFIED: 'OTP verification successful',
    PHONE_VERIFIED: 'Phone number verified successfully',
  },
  ERROR: {
    OTP_SEND_FAILED: 'Failed to send OTP',
    OTP_GENERATION_ERROR: 'Error generating OTP',
    OTP_INVALID: 'Invalid or expired OTP',
    OTP_VERIFICATION_ERROR: 'Error verifying OTP',
    OTP_INVALIDATION_ERROR: 'Error invalidating OTP',
    OTP_MAX_ATTEMPTS: 'Maximum verification attempts reached',
    PHONE_NOT_FOUND: 'Phone number not found'
  }
};