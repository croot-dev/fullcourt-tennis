export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Seoul',
  })
}

export function formatTimeRange(start: string, end: string) {
  const format = (value: string) =>
    new Date(value).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Seoul',
    })

  return `${format(start)} - ${format(end)}`
}
