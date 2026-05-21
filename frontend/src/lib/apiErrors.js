function firstValidationMessage(errors) {
  if (!errors || typeof errors !== 'object') {
    return ''
  }

  const firstValue = Object.values(errors).find(Boolean)

  if (Array.isArray(firstValue)) {
    return firstValue[0] ?? ''
  }

  return typeof firstValue === 'string' ? firstValue : ''
}

function messageForStatus(status) {
  switch (status) {
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested record could not be found.'
    case 422:
      return 'Please review the highlighted fields.'
    case 429:
      return 'Too many requests. Please try again shortly.'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Please try again later.'
    default:
      return ''
  }
}

function normalizeApiError(error) {
  const response = error?.response
  const status = response?.status ?? error?.status
  const errors = response?.data?.errors ?? error?.errors ?? {}
  const validationMessage = firstValidationMessage(errors)
  const backendMessage =
    response?.data?.message ??
    response?.data?.error ??
    error?.message

  const message =
    validationMessage ||
    backendMessage ||
    messageForStatus(status) ||
    'Something went wrong. Please try again.'

  return {
    ...error,
    config: response?.config ?? error?.config,
    errors,
    message,
    status,
  }
}

export { normalizeApiError }
