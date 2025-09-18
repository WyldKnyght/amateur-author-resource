// frontend/src/components/common/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) =>
  message ? <div className="error-message">{message}</div> : null;

export default ErrorMessage;
