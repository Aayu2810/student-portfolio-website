'use client'

import { NotificationPopup, useGlobalNotification } from './NotificationPopup'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notification, closeNotification } = useGlobalNotification()

  return (
    <>
      {children}
      {notification && (
        <NotificationPopup
          isOpen={true}
          onClose={closeNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          documentTitle={notification.documentTitle}
          documentUrl={notification.documentUrl}
          actionText={notification.actionText}
          onAction={notification.onAction}
        />
      )}
    </>
  )
}
