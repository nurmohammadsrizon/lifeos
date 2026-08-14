def check_time(value: str):
  month = [
    'month',
    'm',
    'monthly',
    'mash',
    'mont',
    '30 days',
  ]
  week = [
    '7 days',
    'week',
    'weekly',
    'this week',
    'wek',
    'weeek'
  ]
  day = [
    'day',
    'din',
    '1',
    '24 hours',
    'daily'
  ]
  
  if value in day:
    return "daily"
  elif value in month:
    return "monthly",
  elif value in week:
    return "weekly"
  else:
    return "couldnot understand the quest time"