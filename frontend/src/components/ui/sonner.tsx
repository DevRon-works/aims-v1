import { Toaster as Sonner } from 'sonner'

function Toaster() {
  return (
    <Sonner
      closeButton
      duration={4000}
      expand
      position="bottom-right"
      offset="22px"
      gap={10}
      visibleToasts={4}
      toastOptions={{
        classNames: {
          actionButton: 'aims-sonner-action',
          cancelButton: 'aims-sonner-cancel',
          closeButton: 'aims-sonner-close',
          description: 'aims-sonner-description',
          icon: 'aims-sonner-icon',
          title: 'aims-sonner-title',
          toast: 'aims-sonner-toast',
        },
      }}
    />
  )
}

export { Toaster }
