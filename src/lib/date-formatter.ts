// Date Formatter Utilities
export const dateFormatter = {
  formatDate: (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString()
  },
  
  formatDateTime: (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleString()
  },
  
  getRelativeTime: (date: Date | string) => {
    // TODO: Implement relative time (e.g., "2 hours ago")
    return ''
  },
  
  formatExpiry: (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return `${days} days remaining`
  }
}
